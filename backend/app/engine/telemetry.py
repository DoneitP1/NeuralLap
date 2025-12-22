import time
import threading
import asyncio
import platform
import random
import math
from loguru import logger
from app.engine.strategy import strategy_engine # NEW
from app.engine.hardware import hardware_engine # NEW
from app.engine.iot import iot_engine # NEW

# Try import irsdk, else use Mock
try:
    import irsdk
    IRACING_AVAILABLE = True
except ImportError:
    IRACING_AVAILABLE = False
    logger.warning("iRacing SDK not found (Mac/Linux detected?). Using Mock Data.")

class TelemetryEngine:
    def __init__(self, sio_server, loop):
        self.sio = sio_server
        self.loop = loop
        self.running = False
        self.thread = None
        self.connected = False
        
        self.ir = None
        if IRACING_AVAILABLE:
            self.ir = irsdk.IRSDK()
        
        # State
        self.latest_data = {}
        # Manual Overrides (for Debug/Demo)
        self.manual_state = {
            "ghost": None,
            "spotter_left": False,
            "spotter_right": False,
            "ar_brake": None,
            "ar_apex": None
        }

    def start(self):
        if self.running:
            return
        self.running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()
        logger.info(f"Telemetry Engine Started (Mode: {'LIVE' if IRACING_AVAILABLE else 'MOCK'})")

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



    def stop(self):
        self.running = False
        if self.thread:
            self.thread.join()
            
    def _loop(self):
        while self.running:
            if IRACING_AVAILABLE:
                self._process_iracing()
            else:
                self._process_mock()
            
            time.sleep(1/60)

    def _emit(self, data):
        asyncio.run_coroutine_threadsafe(
            self.sio.emit('telemetry_update', data), 
            self.loop
        )

    def _process_mock(self):
        # Mock Data Generator for Mac Development
        self.connected = True
        t = time.time()
        
        # --- STEERING LOGIC ---
        # Decay steering back to center if no input (Removing this as we reverted manual_steering state)
        # self.manual_state['manual_steering'] *= 0.95
        
        # --- 1. SPOTTER LOGIC ---
        spotter_left = self.manual_state['spotter_left']
        spotter_right = self.manual_state['spotter_right']
        
        # Fallback to auto-cycle if no manual input
        if not spotter_left and not spotter_right:
            cycle = t % 15
            if 2 < cycle < 5: spotter_left = True
            elif 8 < cycle < 11: spotter_right = True

        # --- 2. AR BRAKE LOGIC ---
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

        # --- 3. GHOST LOGIC ---
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
        
        # Lap Prediction Mock Logic
        base_lap = 94.0 # 1:34.0
        predicted_lap = base_lap + (math.sin(t * 0.2) * 0.5) 
        potential_lap = base_lap - 0.8 
        
        # Coach Audio Logic
        coach_msg = None
        # Manual Trigger
        if self.manual_state.get('coach_audio'):
            coach_msg = self.manual_state['coach_audio'] # Get the text
            self.manual_state['coach_audio'] = None # Reset immediately (one-shot)
        
        # Auto Cycle (Mocking a message at t=13)
        if 13.0 < (t % 15) < 13.05: # Trigger once per cycle roughly
             coach_msg = "Wide on exit, watch track limits."

        # Smart Relative Table Mock
        relative_drivers = [
            { "pos": "P5", "car_idx": 12, "name": "Max Ver", "gap": 5.2, "ir": "8.2k", "sr": "A 4.99", "class_color": "white", "is_lapped": False },
            { "pos": "P6", "car_idx": 4,  "name": "Lando No", "gap": 2.1, "ir": "7.5k", "sr": "A 3.50", "class_color": "white", "is_lapped": False },
            { "pos": "P7", "car_idx": 44, "name": "Lew Ham",  "gap": 0.8, "ir": "9.0k", "sr": "A 4.99", "class_color": "red", "is_lapped": False },
            { "pos": "P9", "car_idx": 16, "name": "Char Lec", "gap": -0.5, "ir": "6.8k", "sr": "B 2.40", "class_color": "white", "is_lapped": False },
            { "pos": "P10", "car_idx": 63, "name": "Geo Rus", "gap": -4.2, "ir": "6.5k", "sr": "A 2.10", "class_color": "blue",  "is_lapped": True },
            { "pos": "P11", "car_idx": 81, "name": "Osc Pia", "gap": -12.5,"ir": "5.5k", "sr": "C 3.80", "class_color": "white", "is_lapped": False },
        ]
        
        # Fuel Strategy Mock Logic
        # Simulate tank draining over time (15s cycle)
        # Full Tank: 50L. Cons: 2.5L/lap. Laps: 20
        # Critical moment at t=10
        mock_fuel_level = 50 - (t % 50) # Drains from 50 to 0
        cons_per_lap = 2.5
        laps_remaining = 12
        fuel_needed = (laps_remaining * cons_per_lap) + 2.0 # +2L Safety
        fuel_to_add = max(0, fuel_needed - mock_fuel_level)
        box_call = mock_fuel_level < 5.0 # Critical fuel

        fuel_strategy = {
            "fuel_level": mock_fuel_level,
            "cons_per_lap": cons_per_lap,
            "laps_remaining": laps_remaining,
            "fuel_to_add": fuel_to_add,
            "box_this_lap": box_call
        }
        # Override coach audio if Box Box
        if box_call and (int(t) % 5 == 0): # Say it every 5s
             coach_msg = "Box box, box box. Low fuel."

        # Trail Braking Mock Logic
        # Trail braking is effective when brake decreases as steering increases
        steering_val = abs(math.sin(t * 0.3))
        brake_val = abs(math.cos(t * 0.8)) if math.sin(t * 0.8) < 0 else 0
        
        # Simple Mock Metric: High if both brake and steering are active
        trail_braking_quality = 0.0
        if brake_val > 0.1 and steering_val > 0.1:
             trail_braking_quality = min(1.0, (brake_val + steering_val) / 1.5)

        # Radar Logic (Mock)
        # Simulate 2 cars orbiting
        radar_cars = []
        
        # Car 1: Orbiting close
        orbit_t = t * 0.5
        radar_cars.append({
            "id": 1,
            "x": math.sin(orbit_t) * 4, # +/- 4 meters lateral
            "y": math.cos(orbit_t) * 10, # +/- 10 meters longitudinal
            "color": "white",
            "class_color": "blue" 
        })
        
        # Car 2: Falling back and forth
        radar_cars.append({
            "id": 2,
            "x": 2.5,
            "y": math.sin(t * 0.2) * 20 - 5,
            "color": "red",
            "class_color": "red"
        })
        
        # Auto-Setup Sync Logic (Mock)
        # Simulate detecting a track causing a setup suggestion
        setup_suggestion = None
        # Trigger every 30s for 5 seconds
        if 5.0 < (t % 60) < 10.0:
            air_temp = 25.0
            track_temp = 32.0
             # Tire Pressure Bot Logic
             # Ideal pressure is 23.0 psi at 20C.
             # Current air temp 25C -> needs less pressure?
             # Simple rule: -0.1 psi per 1C over 20C
            pressure_offset = -0.1 * (air_temp - 20.0)
            
            setup_suggestion = {
                "active": True,
                "track": "Silverstone GP",
                "car": "Mercedes W13",
                "best_setup_name": "VRS_S3_Quali.sto",
                "source": "VRS Subscription",
                "conditions": f"Air: {air_temp}C | Track: {track_temp}C",
                "tire_bot": {
                    "suggestion": f"Lower all tires by {abs(pressure_offset):.1f} PSI",
                    "reason": f"High Air Temp ({air_temp}C)"
                }
            }
            
        # --- V3 STRATEGY LOGIC ---
        mock_dist = (t * 0.05) % 1.0
        
        # 1. Tire Prediction
        tire_pred = strategy_engine.predict_tire_pressures(current_temp=25 + (mock_dist * 5)) 
        # 2. Pit Window
        pit_alert = strategy_engine.analyze_pit_window(gap_ahead=2.5, gap_behind=1.5, laps_remaining=20)
        # 3. Lift & Coast
        lift_coast = strategy_engine.calculate_lift_coast(mock_dist)

        data = {
            "speed": speed,
            "rpm": 5000 + (math.sin(t) * 3000),
            "gear": int(abs(math.sin(t * 0.1) * 6)) + 1,
            "throttle": abs(math.sin(t * 0.8)),
            "brake": brake_val,
            "clutch": abs(math.cos(t * 0.5)) if (t % 10) < 2 else 0, # Clutch usage simulated
            "steering_angle": math.sin(t * 0.3),
            "trail_braking_quality": trail_braking_quality, 
            "lap_dist_pct": (t * 0.05) % 1.0,
            "spotter_left": spotter_left, 
            "spotter_right": spotter_right,
            "ar_brake_box": ar_brake_box,
            "ar_apex_corridor": ar_apex_corridor,
            "ar_lift_coast": lift_coast, # NEW V3.0 AR
            "ghost_data": ghost_data,
            "predicted_lap": predicted_lap,
            "potential_lap": potential_lap,
            "coach_msg": coach_msg,
            "relative_drivers": relative_drivers,
            "bio": iot_engine.get_data(), # NEW V3.1
            "fuel_strategy": fuel_strategy, 
            "radar_cars": radar_cars,
            "setup_suggestion": setup_suggestion, 
            "strategy": { # NEW V3.0 Data
                "tire_prediction": tire_pred,
                "pit_alert": pit_alert
            },
            "flag_state": "yellow" if 20 < (t % 60) < 25 else "green", # Mock Flag State
            "timestamp": t
        }
        
        # Neural Report Logic (Mock)
        # Trigger every 45 seconds (simulating end of a short lap)
        if 40.0 < (t % 60) < 40.05:
            # Generate Report
            # Pilot Score
            score = int(70 + random.uniform(0, 25))
            
            # Mistakes
            corners = ["T1 (Abbey)", "T3 (Village)", "T6 (Brooklands)", "T7 (Luffield)", "T9 (Copse)", "T11 (Maggots)"]
            reasons = ["Braked too early", "Missed Apex", "Overshot Entry", "Throttle too aggressive", "Coast too long"]
            mistakes = []
            for _ in range(3):
                c = random.choice(corners)
                r = random.choice(reasons)
                loss = round(random.uniform(0.1, 0.5), 2)
                mistakes.append({ "corner": c, "feedback": r, "time_lost": loss })
                
            # Traces (Mocking 20 points)
            trace_speed_you = []
            trace_speed_ref = []
            for i in range(20):
                # Simple curve
                base = 100 + math.sin(i * 0.3) * 50
                trace_speed_you.append(base + random.uniform(-5, 5))
                trace_speed_ref.append(base + 10) # Ref slightly faster usually

            report_data = {
                "lap_time": "1:34.215",
                "pilot_score": score,
                "mistakes": mistakes,
                "traces": {
                    "speed_you": trace_speed_you,
                    "speed_ref": trace_speed_ref
                }
            }
        if report_data:
            # Add bio data to report for analysis
            report_data["bio"] = iot_engine.get_data()
            session.add_lap(report_data)
            
            # Emit specifically as a report event
            self._emit_report(report_data)

        # Hardware & IoT Processing
        hw_events = hardware_engine.process(data)
        data['hardware'] = hw_events
        
        # Update Mock IoT (if needed)
        iot_engine.update_mock_data(speed, brake, rpm)
        
        self.latest_data = data
        self._emit(data)

    def _emit_report(self, data):
        asyncio.run_coroutine_threadsafe(
            self.sio.emit('neural_report', data), 
            self.loop
        )

        # NEURAL COMMUNITY: Submit to League (Mocking League ID 1 for now)
        try:
            # Check if this is a "League Mode" session? For now, we auto-submit to "Global Daily League"
            from app.core.database import engine as db_engine
            from sqlmodel import Session, select
            from app.engine.models.community import League, LeagueEntry
            
            with Session(db_engine) as session:
                # Get or Create automated daily league
                league = session.exec(select(League).where(League.name == "Global Daily")).first()
                if not league:
                    league = League(name="Global Daily", criteria="cleanest")
                    session.add(league)
                    session.commit()
                    session.refresh(league)
                
                # Calculate Scores from Report
                # Cleanliness: 100 - (mistakes count * 5)
                mistake_count = len(data.get('mistakes', []))
                cleanliness_score = max(0, 100 - (mistake_count * 5))
                
                # Consistency: Mocking it for now (would need lap history)
                # Using Pilot Score as proxy for consistency in this MVP
                consistency_score = data.get('pilot_score', 0)
                
                entry = LeagueEntry(
                    league_id=league.id,
                    driver_name="You", # TODO: Get from User Profile or SteamID
                    lap_time=94.215, # Mock: Parse "1:34.215" -> 94.215
                    cleanliness_score=cleanliness_score,
                    consistency_score=consistency_score
                )
                session.add(entry)
                session.commit()
                # logger.info(f"Submitted Lap to League: {league.name}")
        except Exception as e:
            logger.error(f"Failed to submit to league: {e}")

    def _process_iracing(self):
        # Check connection
        if not self.connected:
            if self.ir and self.ir.startup():
                self.connected = True
                logger.success("Connected to iRacing Simulator")
            else:
                time.sleep(1)
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
                 
            # Auto-Setup Sync (Real - Placeholder)
            # Fetching SessionString is heavy, usually done once.
            # Here we just pass None or simple placeholder to avoid crash if requested
            # Could implement full YAML parsing of self.ir['SessionInfo']['SessionString']
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
                "setup_suggestion": setup_suggestion, # NEW
                "lap_dist_pct": self.ir['LapDistPct'],
                "timestamp": time.time()
            }
            self.latest_data = data
            self._emit(data)
        except Exception as e:
            self.connected = False
            logger.error(f"Telemetry Error: {e}")

# Singleton instance (initialized in main)
telemetry_engine = None
