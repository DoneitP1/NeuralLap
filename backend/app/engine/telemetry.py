import time
import threading
import asyncio
import platform
import random
import math
from loguru import logger
from app.engine.strategy import strategy_engine
from app.engine.hardware import hardware_engine
from app.engine.iot import iot_engine

# Try import irsdk
try:
    import irsdk
    IRACING_AVAILABLE = True
except ImportError:
    IRACING_AVAILABLE = False
    logger.warning("iRacing SDK not found.")

# Try import LMU
try:
    from app.engine.lmu import MMapControl, LMUConstants, LMUObjectOut
    LMU_AVAILABLE = True
except ImportError as e:
    LMU_AVAILABLE = False
    logger.warning(f"LMU modules not found: {e}")

class TelemetryEngine:
    def __init__(self, sio_server, loop):
        self.sio = sio_server
        self.loop = loop
        self.running = False
        self.thread = None
        self.connected = False
        self.game_running = None # 'iracing' or 'lmu' or None
        
        self.ir = None
        if IRACING_AVAILABLE:
            self.ir = irsdk.IRSDK()
        
        self.lmu = None

        # State
        self.latest_data = {}
        # Manual Overrides (for Debug/Demo)
        self.manual_state = {
            "ghost": None,
            "spotter_left": False,
            "spotter_right": False,
            "ar_brake": None,
            "ar_apex": None,
            "coach_audio": None
        }
        
        # Session Management
        self.active_user_id = None
        self.current_session_id = None


    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()
        logger.info(f"Telemetry Engine Started. Available: iRacing={IRACING_AVAILABLE}, LMU={LMU_AVAILABLE}")

        # Register Event Handlers directly
        @self.sio.on('debug_command')
        async def on_debug_command(sid, data):
            cmd = data.get('type')
            logger.info(f"Debug Command Received: {cmd}")
            
            if cmd == 'spawn_ghost':
                self.manual_state['ghost'] = {
                    "active": True,
                    "type": "error_correction",
                    "relative_distance": 0,
                    "lane_offset": 0,
                    "speed_diff": 20,
                    "start_time": time.time()
                }
            elif cmd == 'brake_input':
                 if 'manual_speed' not in self.manual_state: self.manual_state['manual_speed'] = 50
                 self.manual_state['manual_speed'] -= 10
            elif cmd == 'trigger_coach':
                 # Set a message to be picked up by the loop
                 msg = data.get('value', "Check your delta.")
                 self.manual_state['coach_audio'] = msg
            elif cmd == 'trigger_brake':
                 self.manual_state['ar_brake'] = {
                    "active": True,
                    "distance": 150,
                    "urgency": 0,
                    "start_time": time.time()
                 }
            elif cmd == 'trigger_spotter_left':
                self.manual_state['spotter_left'] = True
                threading.Timer(3.0, lambda: self.manual_state.update({'spotter_left': False})).start()
            elif cmd == 'trigger_spotter_right':
                self.manual_state['spotter_right'] = True
                threading.Timer(3.0, lambda: self.manual_state.update({'spotter_right': False})).start()
                
        @self.sio.on('set_active_user')
        async def on_set_active_user(sid, user_id):
             logger.info(f"Setting active user to: {user_id}")
             self.active_user_id = user_id

    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()
        if self.lmu:
            try:
                self.lmu.close()
            except:
                pass
            
    def _loop(self):
        while self.running:
            if self.connected:
                if self.game_running == 'iracing':
                    self._process_iracing()
                elif self.game_running == 'lmu':
                    self._process_lmu()
                else:
                    self._process_mock()
            else:
                # Try to connect
                connected_something = False

                if IRACING_AVAILABLE and self._try_connect_iracing():
                    connected_something = True
                elif LMU_AVAILABLE and self._try_connect_lmu():
                    connected_something = True

                if not connected_something:
                    if not IRACING_AVAILABLE and not LMU_AVAILABLE:
                         # Development mode on unsupported platform
                         self._process_mock()
                    else:
                         # Wait and retry
                         time.sleep(1)
            
            time.sleep(1/60)

    def _try_connect_iracing(self):
        try:
            if self.ir and self.ir.startup():
                self.connected = True
                self.game_running = 'iracing'
                logger.success("Connected to iRacing Simulator")
                return True
        except Exception:
            pass
        return False

    def _try_connect_lmu(self):
        try:
            self.lmu = MMapControl(LMUConstants.LMU_SHARED_MEMORY_FILE, LMUObjectOut)
            self.lmu.create(access_mode=0)
            self.connected = True
            self.game_running = 'lmu'
            logger.success("Connected to Le Mans Ultimate")
            return True
        except Exception:
            # Likely file not found or permission error if game not running
            return False

    def _emit(self, data):
        asyncio.run_coroutine_threadsafe(
            self.sio.emit('telemetry_update', data), 
            self.loop
        )

    def _emit_report(self, data):
        asyncio.run_coroutine_threadsafe(
            self.sio.emit('neural_report', data),
            self.loop
        )
        # League submission logic (simplified/stubbed from original)
        try:
            from app.core.database import engine as db_engine
            from sqlmodel import Session, select
            from app.engine.models.community import League, LeagueEntry
            from app.engine.models.telemetry_session import TelemetrySession

            with Session(db_engine) as session:
                # 1. Update/Create Telemetry Session
                if self.active_user_id:
                     # Check if we have an open session or create new
                     # For simplicity, let's treat each 'report' as a session summary or part of it
                     # Ideally, we open session on game start, close on end.
                     # Here just logging the lap.
                     t_session = TelemetrySession(
                        user_id=self.active_user_id,
                        track=data.get('track', 'Unknown'),
                        car=data.get('car', 'Unknown'),
                        best_lap=94.215, # Mock
                        lap_count=1
                     )
                     session.add(t_session)
                     session.commit()

                league = session.exec(select(League).where(League.name == "Global Daily")).first()
                if not league:
                    league = League(name="Global Daily", criteria="cleanest")
                    session.add(league)
                    session.commit()
                    session.refresh(league)

                mistake_count = len(data.get('mistakes', []))
                cleanliness_score = max(0, 100 - (mistake_count * 5))
                consistency_score = data.get('pilot_score', 0)

                entry = LeagueEntry(
                    league_id=league.id,
                    driver_name="You",
                    lap_time=94.215,
                    cleanliness_score=cleanliness_score,
                    consistency_score=consistency_score
                )
                session.add(entry)
                session.commit()
        except Exception as e:
            # Silently fail if DB not ready or other issue
            pass

    def _process_lmu(self):
        try:
            self.lmu.update()

            # Basic validity check (e.g. game version > 0)
            if self.lmu.data.generic.gameVersion == 0:
                 # Should we disconnect? Or just wait?
                 # If memory map exists but game closed, version might be 0?
                 pass

            telemetry = self.lmu.data.telemetry
            scoring = self.lmu.data.scoring

            player_idx = telemetry.playerVehicleIdx
            if player_idx < 0 or player_idx >= LMUConstants.MAX_MAPPED_VEHICLES:
                # No player vehicle?
                return

            player = telemetry.telemInfo[player_idx]

            # Speed Calculation (Vector Magnitude)
            vx = player.mLocalVel.x
            vy = player.mLocalVel.y
            vz = player.mLocalVel.z
            speed_ms = math.sqrt(vx*vx + vy*vy + vz*vz)

            # Steering
            # LMU mUnfilteredSteering is normalized -1.0 to 1.0 (left to right).
            # We convert to radians using mPhysicalSteeringWheelRange (total range in radians).
            # mPhysicalSteeringWheelRange is the full range (e.g., 900 degrees).
            # So angle = normalized * (range / 2).
            # Note: Verify if mPhysicalSteeringWheelRange is radians or degrees.
            # Assuming radians as other rotation fields are radians.
            if hasattr(player, 'mPhysicalSteeringWheelRange') and player.mPhysicalSteeringWheelRange > 0:
                steering = player.mUnfilteredSteering * 0.5 * player.mPhysicalSteeringWheelRange
            else:
                 # Fallback if range not available (approx 450 degrees = ~7.85 rad)
                 steering = player.mUnfilteredSteering * 7.85

            # Trail Braking
            brake = player.mUnfilteredBrake
            tb_quality = 0.0
            if brake > 0.05 and abs(steering) > 0.05:
                 tb_quality = min(1.0, (brake + (abs(steering) * 2)) / 2.0)

            # Radar Logic
            radar_cars = []
            num_vehicles = scoring.scoringInfo.mNumVehicles

            # Optimization: Only check first N vehicles or use activeVehicles count
            # scoringInfo.mNumVehicles is total.

            # We need player orientation to calculate relative positions
            # mOri rows: [0]=Right, [1]=Up, [2]=Forward (approx)
            ori = player.mOri
            p_pos = player.mPos

            for i in range(min(num_vehicles, LMUConstants.MAX_MAPPED_VEHICLES)):
                if i == player_idx: continue

                other = telemetry.telemInfo[i]
                # Check if active/valid? mID > 0?

                # Calculate relative position
                dx = other.mPos.x - p_pos.x
                dy = other.mPos.y - p_pos.y
                dz = other.mPos.z - p_pos.z

                # Dot product with player orientation vectors to get local coordinates
                # Local X (Right)
                rx = dx * ori[0].x + dy * ori[0].y + dz * ori[0].z
                # Local Z (Forward)
                ry = dx * ori[2].x + dy * ori[2].y + dz * ori[2].z

                # Filter cars too far away (e.g. > 50m)
                if abs(rx) < 20 and abs(ry) < 50:
                     radar_cars.append({
                        "id": other.mID,
                        "x": rx,
                        "y": ry,
                        "color": "orange", # Todo: Class based color
                        "class_color": "white"
                     })

            # Lap Distance
            # scoringInfo.mLapDist is track length
            # player.mLapDist is current dist (Wait, player struct in telemetry doesn't have mLapDist?)
            # Check VehicleScoringInfo
            player_scoring = scoring.vehScoringInfo[player_idx]
            lap_dist = player_scoring.mLapDist
            track_length = scoring.scoringInfo.mLapDist
            lap_dist_pct = 0.0
            if track_length > 0:
                lap_dist_pct = lap_dist / track_length

            # Setup Suggestion
            # Mapping LMU specific data if available
            setup_suggestion = None

            data = {
                "speed": speed_ms * 3.6,
                "rpm": player.mEngineRPM,
                "gear": player.mGear,
                "throttle": player.mUnfilteredThrottle,
                "brake": player.mUnfilteredBrake,
                "clutch": player.mUnfilteredClutch,
                "steering_angle": steering,
                "trail_braking_quality": tb_quality,
                "radar_cars": radar_cars,
                "setup_suggestion": setup_suggestion,
                "lap_dist_pct": lap_dist_pct,
                "timestamp": time.time()
            }

            # Hardware & IoT Processing
            hw_events = hardware_engine.process(data)
            data['hardware'] = hw_events

            self.latest_data = data
            self._emit(data)

        except Exception as e:
            logger.error(f"LMU Processing Error: {e}")
            self.connected = False
            self.game_running = None
            try:
                self.lmu.close()
            except:
                pass
            self.lmu = None


    def _process_iracing(self):
        # Check connection validity
        try:
             if not self.ir.is_connected:
                  # Try to reconnect or detect disconnect
                  # irsdk.startup() checks connection.
                  # is_connected is a property of IRSDK wrapper usually, or we check a var
                  # The python irsdk library usually has 'is_connected' flag or we check header
                  if not self.ir.startup():
                       raise Exception("Disconnected")
        except:
             self.connected = False
             self.game_running = None
             return

        try:
            self.ir.freeze_var_buffer_latest()

            # Simple Trail Braking Metric Calculation
            brake = self.ir['Brake']
            steering = abs(self.ir['SteeringWheelAngle'])
            tb_quality = 0.0
            if brake > 0.05 and steering > 0.05:
                 tb_quality = min(1.0, (brake + (steering * 2)) / 2.0)

            # Radar Logic (Real - Simplified)
            radar_cars = []
            clr = self.ir['CarLeftRight']
            if clr & 2: # Car Left
                 radar_cars.append({ "id": 999, "x": -2.0, "y": 0, "color": "orange", "class_color": "white" })
            if clr & 4: # Car Right
                 radar_cars.append({ "id": 998, "x": 2.0, "y": 0, "color": "orange", "class_color": "white" })

            setup_suggestion = None

            data = {
                "speed": self.ir['Speed'] * 3.6,
                "rpm": self.ir['RPM'],
                "gear": self.ir['Gear'],
                "throttle": self.ir['Throttle'],
                "brake": self.ir['Brake'],
                "clutch": self.ir['Clutch'],
                "steering_angle": self.ir['SteeringWheelAngle'],
                "trail_braking_quality": tb_quality,
                "radar_cars": radar_cars,
                "setup_suggestion": setup_suggestion,
                "lap_dist_pct": self.ir['LapDistPct'],
                "timestamp": time.time()
            }

            # Hardware & IoT Processing
            hw_events = hardware_engine.process(data)
            data['hardware'] = hw_events

            self.latest_data = data
            self._emit(data)
        except Exception as e:
            logger.error(f"Telemetry Error: {e}")
            self.connected = False
            self.game_running = None

    def _process_mock(self):
        # Mock Data Generator for Mac Development
        self.connected = True
        t = time.time()
        
        # --- SPOTTER LOGIC ---
        spotter_left = self.manual_state['spotter_left']
        spotter_right = self.manual_state['spotter_right']
        
        if not spotter_left and not spotter_right:
            cycle = t % 15
            if 2 < cycle < 5: spotter_left = True
            elif 8 < cycle < 11: spotter_right = True

        # --- AR BRAKE LOGIC ---
        ar_brake_box = None
        if self.manual_state['ar_brake']:
            elapsed = t - self.manual_state['ar_brake']['start_time']
            if elapsed > 4.0:
                self.manual_state['ar_brake'] = None
            else:
                dist = 150 - (elapsed * 40)
                ar_brake_box = {
                    "active": True,
                    "distance": max(0, dist),
                    "urgency": min(1.0, elapsed / 3.0)
                }
        elif 5 < (t%15) < 8:
             dist = (8 - (t%15)) * 50
             ar_brake_box = { "active": True, "distance": dist, "urgency": 1.0 - (dist/150) }
             
        ar_apex_corridor = None
        if 8 < (t%15) < 10:
             ar_apex_corridor = { "active": True, "type": "entry", "curve_direction": "right" }

        # --- GHOST LOGIC ---
        ghost_data = None
        if self.manual_state['ghost']:
            elapsed = t - self.manual_state['ghost']['start_time']
            if elapsed > 5.0:
                 self.manual_state['ghost'] = None
            else:
                 self.manual_state['ghost']['relative_distance'] = elapsed * 10
                 ghost_data = self.manual_state['ghost']
        elif 11 < (t%15) < 14:
             relative_dist = ((t%15) - 11) * 7
             ghost_data = {
                "active": True, "type": "error_correction", 
                "relative_distance": relative_dist, "lane_offset": 0, "speed_diff": 15
            }

        # Speed Logic
        speed = (abs(math.sin(t * 0.5)) * 200) + random.uniform(-2, 2)
        
        # Lap Prediction
        base_lap = 94.0
        predicted_lap = base_lap + (math.sin(t * 0.2) * 0.5) 
        potential_lap = base_lap - 0.8 
        
        # Coach Audio
        coach_msg = None
        if self.manual_state.get('coach_audio'):
            coach_msg = self.manual_state['coach_audio']
            self.manual_state['coach_audio'] = None
        
        if 13.0 < (t % 15) < 13.05:
             coach_msg = "Wide on exit, watch track limits."

        # Relative Drivers
        relative_drivers = [
            { "pos": "P5", "car_idx": 12, "name": "Max Ver", "gap": 5.2, "ir": "8.2k", "sr": "A 4.99", "class_color": "white", "is_lapped": False },
            { "pos": "P6", "car_idx": 4,  "name": "Lando No", "gap": 2.1, "ir": "7.5k", "sr": "A 3.50", "class_color": "white", "is_lapped": False },
            { "pos": "P7", "car_idx": 44, "name": "Lew Ham",  "gap": 0.8, "ir": "9.0k", "sr": "A 4.99", "class_color": "red", "is_lapped": False },
        ]
        
        # Fuel Strategy
        mock_fuel_level = 50 - (t % 50)
        box_call = mock_fuel_level < 5.0

        fuel_strategy = {
            "fuel_level": mock_fuel_level,
            "cons_per_lap": 2.5,
            "laps_remaining": 12,
            "fuel_to_add": max(0, 32.0 - mock_fuel_level),
            "box_this_lap": box_call
        }
        if box_call and (int(t) % 5 == 0):
             coach_msg = "Box box, box box. Low fuel."

        # Trail Braking
        steering_val = abs(math.sin(t * 0.3))
        brake_val = abs(math.cos(t * 0.8)) if math.sin(t * 0.8) < 0 else 0
        trail_braking_quality = 0.0
        if brake_val > 0.1 and steering_val > 0.1:
             trail_braking_quality = min(1.0, (brake_val + steering_val) / 1.5)

        # Radar
        radar_cars = []
        orbit_t = t * 0.5
        radar_cars.append({
            "id": 1,
            "x": math.sin(orbit_t) * 4,
            "y": math.cos(orbit_t) * 10,
            "color": "white",
            "class_color": "blue" 
        })
        
        # Setup Sync
        setup_suggestion = None
        if 5.0 < (t % 60) < 10.0:
            setup_suggestion = {
                "active": True,
                "track": "Silverstone GP",
                "car": "Mercedes W13",
                "best_setup_name": "VRS_S3_Quali.sto",
                "source": "VRS Subscription",
                "conditions": "Air: 25.0C | Track: 32.0C",
                "tire_bot": {
                    "suggestion": "Lower all tires by 0.5 PSI",
                    "reason": "High Air Temp (25.0C)"
                }
            }
            
        # Strategy Logic
        mock_dist = (t * 0.05) % 1.0
        tire_pred = strategy_engine.predict_tire_pressures(current_temp=25 + (mock_dist * 5)) 
        pit_alert = strategy_engine.analyze_pit_window(gap_ahead=2.5, gap_behind=1.5, laps_remaining=20)
        lift_coast = strategy_engine.calculate_lift_coast(mock_dist)

        data = {
            "speed": speed,
            "rpm": 5000 + (math.sin(t) * 3000),
            "gear": int(abs(math.sin(t * 0.1) * 6)) + 1,
            "throttle": abs(math.sin(t * 0.8)),
            "brake": brake_val,
            "clutch": abs(math.cos(t * 0.5)) if (t % 10) < 2 else 0,
            "steering_angle": math.sin(t * 0.3),
            "trail_braking_quality": trail_braking_quality, 
            "lap_dist_pct": (t * 0.05) % 1.0,
            "spotter_left": spotter_left, 
            "spotter_right": spotter_right,
            "ar_brake_box": ar_brake_box,
            "ar_apex_corridor": ar_apex_corridor,
            "ar_lift_coast": lift_coast,
            "ghost_data": ghost_data,
            "predicted_lap": predicted_lap,
            "potential_lap": potential_lap,
            "coach_msg": coach_msg,
            "relative_drivers": relative_drivers,
            "bio": iot_engine.get_data(),
            "fuel_strategy": fuel_strategy, 
            "radar_cars": radar_cars,
            "setup_suggestion": setup_suggestion, 
            "strategy": {
                "tire_prediction": tire_pred,
                "pit_alert": pit_alert
            },
            "flag_state": "yellow" if 20 < (t % 60) < 25 else "green",
            "timestamp": t
        }
        
        # Neural Report
        if 40.0 < (t % 60) < 40.05:
            # Generate Report (Simplified)
            report_data = {
                "lap_time": "1:34.215",
                "pilot_score": int(70 + random.uniform(0, 25)),
                "mistakes": [{"corner": "T1", "feedback": "Missed Apex", "time_lost": 0.2}],
                "traces": { "speed_you": [100]*20, "speed_ref": [110]*20 }
            }
            report_data["bio"] = iot_engine.get_data()
            self._emit_report(report_data)

        # Hardware & IoT Processing
        hw_events = hardware_engine.process(data)
        data['hardware'] = hw_events
        
        iot_engine.update_mock_data(speed, brake_val, 5000)
        
        self.latest_data = data
        self._emit(data)

# Singleton instance
telemetry_engine = None
