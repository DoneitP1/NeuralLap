import asyncio
import socketio
import random
import time
import sys
import json
from loguru import logger

# Try importing bleak
try:
    from bleak import BleakScanner, BleakClient
    BLE_AVAILABLE = True
except ImportError:
    BLE_AVAILABLE = False
    logger.warning("Bleak not installed. Service will run in MOCK mode.")

# Constants
HR_SERVICE_UUID = "0000180d-0000-1000-8000-00805f9b34fb"
HR_MEASUREMENT_CHAR_UUID = "00002a37-0000-1000-8000-00805f9b34fb"
BACKEND_URL = "http://localhost:8000"

# Setup Socket.IO Client
sio = socketio.AsyncClient()

class BioService:
    def __init__(self):
        self.heart_rate = 70
        self.device_name = None
        self.connected = False
        self.running = True
        self.mock_mode = True # Default until real connection

    async def start(self):
        logger.info(f"BioService: Connecting to Backend at {BACKEND_URL}...")
        try:
            await sio.connect(BACKEND_URL)
            logger.success("BioService: Connected to Main Backend via Socket.IO")
        except Exception as e:
            logger.error(f"BioService: Sync connection failed: {e}. Retrying in loop.")

        # Start BLE Scan & Loop
        await asyncio.gather(
            self.ble_loop(),
            self.report_loop()
        )

    async def ble_loop(self):
        """Scans and maintains BLE connection."""
        if not BLE_AVAILABLE:
            logger.info("BioService: No BLE lib. Staying in Mock Mode.")
            return

        while self.running:
            if not self.connected:
                logger.info("BioService: Scanning for Heart Rate Monitors...")
                try:
                    device = await BleakScanner.find_device_by_service(HR_SERVICE_UUID, timeout=5.0)
                    if device:
                        logger.success(f"BioService: Found {device.name} ({device.address})")
                        self.device_name = device.name
                        
                        async with BleakClient(device) as client:
                            logger.success(f"BioService: Connected to {device.name}")
                            self.connected = True
                            self.mock_mode = False
                            
                            await client.start_notify(HR_MEASUREMENT_CHAR_UUID, self._notification_handler)
                            
                            while client.is_connected and self.running:
                                await asyncio.sleep(1.0)
                                
                            logger.warning("BioService: Disconnected from device.")
                            self.connected = False
                            self.mock_mode = True 
                    else:
                        # logger.debug("BioService: No device found. Retrying...")
                        pass
                except Exception as e:
                    logger.error(f"BioService: BLE Error: {e}")
            
            await asyncio.sleep(5.0)

    def _notification_handler(self, sender, data):
        """Parses standard BLE Heart Rate data."""
        flag = data[0]
        if (flag & 0x01) == 0:
            hr_val = data[1]
        else:
            hr_val = int.from_bytes(data[1:3], byteorder='little')
        
        self.heart_rate = hr_val

    async def report_loop(self):
        """Sends data to backend at 10Hz."""
        while self.running:
            # If Mock Mode, simulate data
            if self.mock_mode:
                self._update_mock_data()
            
            # Determine Stress Level
            stress = self._get_stress_level()
            
            payload = {
                "heart_rate": self.heart_rate,
                "stress_level": stress,
                "connected": self.connected,
                "device": self.device_name if self.connected else "Mock Service",
                "timestamp": time.time()
            }
            
            if sio.connected:
                # Emit to a specific event listener in backend
                # Note: Backend needs to listen for 'bio_update'
                await sio.emit('bio_update', payload)
            
            await asyncio.sleep(0.1) # 10Hz update

    def _update_mock_data(self):
        # Simple wandering for standalone test
        change = random.choice([-1, 0, 1])
        self.heart_rate = max(60, min(180, self.heart_rate + change))

    def _get_stress_level(self):
        if self.heart_rate < 100: return "LOW"
        if self.heart_rate < 130: return "OPTIMAL"
        if self.heart_rate < 160: return "HIGH"
        return "CRITICAL"

if __name__ == "__main__":
    service = BioService()
    try:
        asyncio.run(service.start())
    except KeyboardInterrupt:
        logger.info("BioService: Stopping...")
