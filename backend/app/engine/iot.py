import asyncio
import threading
import random
import time
from loguru import logger

# Try importing bleak, but don't fail if strictly not supported in environment
try:
    from bleak import BleakScanner, BleakClient
    BLE_AVAILABLE = True
except ImportError:
    BLE_AVAILABLE = False
    logger.warning("Bleak not installed. IoT features will be strictly mock-only.")

# Standard Heart Rate Service UUIDs
HR_SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb"
HR_MEASUREMENT_CHAR_UUID = "00002a37-0000-1000-8000-00805f9b34fb"

class IoTEngine:
    def __init__(self):
        self.heart_rate = 70
        self.stress_level = "LOW" # LOW, MEDIUM, HIGH, CRITICAL
        self.connected = False
        self.device_name = None
        self.running = True
        
        # Mock State
        self.target_hr = 70
        self.mock_mode = True # Default to Mock for stability unless connected
        
        # Async Loop for BLE
        if BLE_AVAILABLE:
            self.loop = asyncio.new_event_loop()
            self.thread = threading.Thread(target=self._run_async_loop, daemon=True)
            self.thread.start()
            
            # Trigger connection scan in background
            asyncio.run_coroutine_threadsafe(self.scan_and_connect(), self.loop)

    def _run_async_loop(self):
        asyncio.set_event_loop(self.loop)
        self.loop.run_forever()

    async def scan_and_connect(self):
        """Scans for HR devices and connects to the first one found."""
        if not BLE_AVAILABLE:
            return

        logger.info("IoT: Scanning for BLE Heart Rate devices...")
        try:
            device = await BleakScanner.find_device_by_service(HR_SERVICE_UUID, timeout=5.0)
            if device:
                logger.info(f"IoT: Found device {device.name} ({device.address})")
                self.device_name = device.name
                async with BleakClient(device) as client:
                    self.connected = True
                    self.mock_mode = False
                    logger.success(f"IoT: Connected to {device.name}")
                    
                    await client.start_notify(HR_MEASUREMENT_CHAR_UUID, self._hr_notification_handler)
                    
                    # Keep connection alive while running
                    while self.running and client.is_connected:
                        await asyncio.sleep(1.0)
                        
                    self.connected = False
            else:
                logger.info("IoT: No BLE Heart Rate device found. Continuing in Mock Mode.")
        except Exception as e:
            logger.error(f"IoT: BLE Connection Error: {e}")
            self.connected = False

    def _hr_notification_handler(self, sender, data):
        """Parses standard BLE Heart Rate data."""
        # First byte is flags, second byte is usually HR (if uint8 format)
        # Simplified parsing for standard HR monitors
        flag = data[0]
        if (flag & 0x01) == 0:
            hr_val = data[1] # Uint8
        else:
            hr_val = int.from_bytes(data[1:3], byteorder='little') # Uint16
            
        self.heart_rate = hr_val
        self.mock_mode = False # Ensure we use real data

    def update_mock_data(self, speed, brake, rpm, max_rpm=8000):
        """
        Updates the heart rate based on telemetry if in Mock Mode.
        Simulates physiological response to stress (speed/braking).
        """
        if not self.mock_mode:
            # Still update stress level based on real HR
            self._update_stress_level()
            return

        # 1. Target HR Calculation
        base_hr = 70
        
        # Speed Factor (Adrenaline)
        speed_factor = (speed / 300.0) * 40 # Up to +40 BPM at 300kph
        
        # Braking Factor (G-Force/Effort)
        brake_factor = (brake * brake) * 30 # Up to +30 BPM during heavy braking
        
        # RPM/Noise Factor
        rpm_factor = (rpm / max_rpm) * 10
        
        self.target_hr = base_hr + speed_factor + brake_factor + rpm_factor
        
        # 2. Smooth Transition (Heart rate doesn't jump instantly)
        # Move current HR towards target by a small step
        diff = self.target_hr - self.heart_rate
        step = 0.5 if diff > 0 else 0.2 # Rises faster than it falls
        
        if abs(diff) > 0.5:
            self.heart_rate += step if diff > 0 else -step
            
        # Add some noise (biological variability)
        self.heart_rate += random.uniform(-0.5, 0.5)
        
        self._update_stress_level()

    def _update_stress_level(self):
        hr = self.heart_rate
        if hr < 100:
            self.stress_level = "LOW"
        elif hr < 130:
            self.stress_level = "OPTIMAL"
        elif hr < 160:
            self.stress_level = "HIGH"
        else:
            self.stress_level = "CRITICAL"

    def get_data(self):
        return {
            "heart_rate": int(self.heart_rate),
            "stress_level": self.stress_level,
            "connected": self.connected,
            "device": self.device_name
        }

iot_engine = IoTEngine()
