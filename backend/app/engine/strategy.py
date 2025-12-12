import random

class StrategyEngine:
    def __init__(self):
        self.track_temp_history = []
        self.base_tire_psi = 23.0  # Starting PSI
        self.fuel_per_lap_avg = 1.85 # Liters

    def predict_tire_pressures(self, current_temp):
        """
        Predicts tire pressure 5 laps ahead based on track temp trend.
        Physics: +1C Track Temp ~= +0.1 PSI (Rough rule of thumb)
        """
        self.track_temp_history.append(current_temp)
        if len(self.track_temp_history) > 10:
            self.track_temp_history.pop(0)

        # Calculate Trend
        trend = 0
        if len(self.track_temp_history) >= 2:
            trend = self.track_temp_history[-1] - self.track_temp_history[0]
        
        # Forecast 5 laps (approx 5 mins maybe?)
        # Mock logic: If trend is positive, pressure rises.
        predicted_rise = trend * 0.5 # multiplier
        
        predicted_psi = self.base_tire_psi + predicted_rise + random.uniform(-0.1, 0.1)
        
        return {
            "current_psi": round(self.base_tire_psi + (trend * 0.1), 1),
            "predicted_psi": round(predicted_psi, 1),
            "trend_direction": "UP" if trend > 0.5 else "DOWN" if trend < -0.5 else "STABLE"
        }

    def analyze_pit_window(self, gap_ahead, gap_behind, laps_remaining):
        """
        Determines Undercut/Overcut opportunity.
        """
        # Mock Logic
        # If rival ahead is < 2.0s, Undercut is powerful.
        # If rival behind is < 2.0s, they might Undercut you (Alert).
        
        if laps_remaining > 0 and laps_remaining < 5:
             # End of stint logic
             pass

        alert = None
        
        # Randomly trigger an opportunity for demo purposes
        # In real app, this would check relative gaps and pit stops.
        rng = random.random()
        if rng > 0.98:
            alert = "UNDERCUT AVAILABLE (Gap: 1.2s)"
        elif rng < 0.02:
            alert = "DEFEND UNDERCUT (Box Now!)"
            
        return alert

    def calculate_lift_coast(self, lap_dist_pct):
        """
        Returns AR data for Lift & Coast zones.
        """
        # Mock: Trigger Lift zone at  end of clear straights (e.g. 90% distance)
        # For mock loop (0-100%), let's put it at 45% and 90%
        
        active = False
        distance = 0
        urgency = 0
        
        # Zone A: 40% - 45%
        if 0.40 < lap_dist_pct < 0.45:
            active = True
            distance = (0.45 - lap_dist_pct) * 1000 # Mock meters
            urgency = 1.0
            
        # Zone B: 85% - 90%
        if 0.85 < lap_dist_pct < 0.90:
            active = True
            distance = (0.90 - lap_dist_pct) * 1000
            urgency = 1.0
            
        return {
            "active": active,
            "distance": distance,
            "type": "LIFT"
        }

strategy_engine = StrategyEngine()
