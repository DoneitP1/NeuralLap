import json
import os
import random
from pathlib import Path

HISTORY_FILE = Path("data/history.json")

class AnalysisEngine:
    def __init__(self):
        self._ensure_history_file()

    def _ensure_history_file(self):
        if not HISTORY_FILE.parent.exists():
            HISTORY_FILE.parent.mkdir(parents=True)
        if not HISTORY_FILE.exists():
            with open(HISTORY_FILE, "w") as f:
                json.dump([], f)

    def get_history(self):
        """Load lap history from JSON."""
        try:
            with open(HISTORY_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []

    def get_driver_dna(self):
        """Calculate Driver DNA based on last 50 laps."""
        history = self.get_history()
        if not history:
            # Return default/neutral DNA if no history
            return {
                "aggression": 50,
                "consistency": 50,
                "smoothness": 50,
                "braking_confidence": 50,
                "cornering_speed": 50,
                "archetype": "Rookie"
            }

        # --- SIMULATED LOGIC FOR MVP ---
        # In a real engine, we'd average telemetry metrics.
        # Here we mock it based on "recent avg lap time" or similar heuristics.
        
        # Calculate consistency (Standard Deviation of lap times)
        lap_times = [lap['time'] for lap in history if lap['valid']]
        if len(lap_times) > 1:
            avg_time = sum(lap_times) / len(lap_times)
            variance = sum((t - avg_time) ** 2 for t in lap_times) / len(lap_times)
            consistency = max(0, min(100, 100 - (variance * 10))) # Lower variance = Higher consistency
        else:
            consistency = 50

        # Heuristic Traits (Mocked for now as we don't store full telemetry per lap in JSON yet)
        aggression = random.randint(60, 90) 
        smoothness = random.randint(40, 80)
        braking = random.randint(50, 85)
        cornering = random.randint(60, 90)

        # Determine Archetype
        archetype = "Balanced"
        if aggression > 80: archetype = "Max Verstappen Style (Aggressive)"
        elif smoothness > 80: archetype = "Jenson Button Style (Smooth)"
        elif consistency > 90: archetype = "The Metronome"

        return {
            "aggression": aggression,
            "consistency": int(consistency),
            "smoothness": smoothness,
            "braking_confidence": braking,
            "cornering_speed": cornering,
            "archetype": archetype
        }

    def get_weaknesses(self):
        """Identify top track weaknesses."""
        # Mock Logic: In reality, we'd map corner IDs to sector times.
        corners = ["T1 (La Source)", "T2-4 (Eau Rouge)", "T5 (Les Combes)", "T10 (Pouhon)", "T18 (Bus Stop)"]
        weaknesses = []
        
        # Pick 3 random weaknesses
        for _ in range(3):
            corner = random.choice(corners)
            loss = round(random.uniform(0.1, 0.8), 2)
            reason = random.choice(["Early Braking", "Overshooting Apex", "Late Throttle", "Coasting"])
            weaknesses.append({
                "corner": corner,
                "time_loss": loss,
                "reason": reason,
                "recommendation": f"Try {reason.lower().replace('early', 'later').replace('late', 'earlier')}."
            })
            
        return weaknesses

    def save_lap(self, lap_data):
        """Append a new lap to history."""
        history = self.get_history()
        history.append(lap_data)
        # Keep last 100 laps only
        if len(history) > 100:
            history = history[-100:]
        
        with open(HISTORY_FILE, "w") as f:
            json.dump(history, f)
            
analysis_engine = AnalysisEngine()
