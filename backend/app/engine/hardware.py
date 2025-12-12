class HardwareEngine:
    def __init__(self):
        self.last_light_state = None
        self.last_haptic_state = None
        
    def process(self, data: dict):
        """
        Analyzes telemetry data and returns a dict of hardware events.
        """
        events = {}
        
        # 1. Haptic Feedback Logic (ABS/Locking)
        # Mock Logic: If brake is high, simulate ABS activation chance
        brake = data.get('brake', 0)
        speed = data.get('speed', 0)
        
        haptic_intensity = 0.0
        # Simple ABS Simulation: hard braking at speed
        if brake > 0.8 and speed > 50:
            haptic_intensity = 1.0 # Full vibration
            
        if haptic_intensity > 0:
            events['haptic'] = {
                'type': 'pedal_vibration',
                'motor': 'brake',
                'intensity': haptic_intensity
            }
            
        # 2. RGB Lighting Logic (Flags & RPM)
        # Priority: Flags > RPM > Normal
        light_color = "#000000" # Off
        
        # Flags (Mocking flag data from IR if available, else random mock from Telemetry loop)
        # We need to rely on what's in 'data'
        # Let's add simulated flags to TelemetryEngine mock first, or infer here.
        
        # RPM Shift Light (Universal)
        rpm = data.get('rpm', 0)
        max_rpm = 12000 # Mock max
        rpm_pct = rpm / max_rpm
        
        if rpm_pct > 0.95:
            light_color = "#FF0000" # Red Flash (Shift)
        elif rpm_pct > 0.90:
            light_color = "#0000FF" # Blue
            
        # Mock Flag Logic (Randomly trigger yellow for demo if speed drops suddenly?)
        # Better: TelemetryEngine should provide 'flag_state'
        if data.get('flag_state') == 'yellow':
            light_color = "#FFD700" # Gold/Yellow
        elif data.get('flag_state') == 'blue':
            light_color = "#0000FF"
            
        events['light'] = {
            'color': light_color,
            'source': 'rpm' if rpm_pct > 0.9 else 'flag'
        }
        
        return events

hardware_engine = HardwareEngine()
