import random

class StrategyEngine:
    def __init__(self):
        self.track_temp_history = []
        self.base_tire_psi = 23.0  # Starting PSI
        self.fuel_per_lap_avg = 1.85 # Liters
        self.tire_life_expectancy = {"SOFT": 15, "MEDIUM": 25, "HARD": 40}

    def calculate_tire_degradation(self, laps_driven, tire_compound="SOFT", track_temp=30.0):
        """
        Calculates tire degradation percentage based on compound and conditions.
        """
        base_life = self.tire_life_expectancy.get(tire_compound, 20)
        
        # Temp factor: Higher temp = faster degradation
        temp_factor = 1.0 + (max(0, track_temp - 25) * 0.02)
        
        # Non-linear degradation curve (exponential towards end of life)
        wear_factor = (laps_driven / base_life) ** 1.5
        
        degradation = min(100.0, wear_factor * temp_factor * 100)
        return round(degradation, 1)

    def calculate_fuel_strategy(self, total_laps, laps_completed, fuel_remaining):
        """
        Calculates fuel requirements and saving suggestions.
        """
        laps_remaining = total_laps - laps_completed
        fuel_needed = laps_remaining * self.fuel_per_lap_avg
        
        diff = fuel_remaining - fuel_needed
        
        status = "OK"
        action = "PUSH"
        
        if diff < -2.0:
            status = "CRITICAL"
            action = "HEAVY SAVE"
        elif diff < 0:
            status = "WARNING"
            action = "LIFT & COAST"
        elif diff > 5.0:
            status = "ABUNDANT"
            action = "MAX POWER"
            
        return {
            "fuel_needed": round(fuel_needed, 2),
            "fuel_remaining": round(fuel_remaining, 2),
            "delta": round(diff, 2),
            "status": status,
            "recommended_action": action
        }

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

    def get_strategy_recommendation(self, session_data):
        """
        Aggregates all models to provide a holistic race strategy.
        """
        # Extract data (mocking the extraction for now)
        laps_done = session_data.get("laps_completed", 0)
        total_laps = session_data.get("total_laps", 50)
        fuel_level = session_data.get("fuel_level", 10.0)
        tire_compound = session_data.get("tire_compound", "SOFT")
        track_temp = session_data.get("track_temp", 30.0)
        
        deg = self.calculate_tire_degradation(laps_done, tire_compound, track_temp)
        fuel_strat = self.calculate_fuel_strategy(total_laps, laps_done, fuel_level)
        
        pit_recommendation = "STAY OUT"
        if deg > 70 or fuel_strat["status"] == "CRITICAL":
            pit_recommendation = "BOX BOX"
        
        return {
            "tire_degradation": deg,
            "fuel_strategy": fuel_strat,
            "pit_recommendation": pit_recommendation,
            "tire_compound": tire_compound
        }

strategy_engine = StrategyEngine()
