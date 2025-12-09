import time
import threading
import asyncio
import platform
import random
import math
from loguru import logger

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
        # Allow it to fluctuate slightly to feel "alive"
        base_lap = 94.0 # 1:34.0
        predicted_lap = base_lap + (math.sin(t * 0.2) * 0.5) # 1:33.5 - 1:34.5
        potential_lap = base_lap - 0.8 # 1:33.2 (Always faster)

        data = {
            "speed": speed,
            "rpm": 5000 + (math.sin(t) * 3000),
            "gear": int(abs(math.sin(t * 0.1) * 6)) + 1,
            "throttle": abs(math.sin(t * 0.8)),
            "brake": abs(math.cos(t * 0.8)) if math.sin(t * 0.8) < 0 else 0,
            "steering_angle": math.sin(t * 0.3),
            "lap_dist_pct": (t * 0.05) % 1.0,
            "spotter_left": spotter_left, 
            "spotter_right": spotter_right,
            "ar_brake_box": ar_brake_box,
            "ar_apex_corridor": ar_apex_corridor,
            "ghost_data": ghost_data,
            "predicted_lap": predicted_lap,  # NEW
            "potential_lap": potential_lap,  # NEW
            "timestamp": t
        }
        self.latest_data = data
        self._emit(data)

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
            data = {
                "speed": self.ir['Speed'] * 3.6,
                "rpm": self.ir['RPM'],
                "gear": self.ir['Gear'],
                "throttle": self.ir['Throttle'],
                "brake": self.ir['Brake'],
                "steering_angle": self.ir['SteeringWheelAngle'],
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
