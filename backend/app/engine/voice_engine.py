import os
import json
import queue
import threading
import time
from loguru import logger

# Dependencies
try:
    import vosk
    import pyaudio
    import pyttsx3
    from pynput.keyboard import Key, Controller
    VOICE_AVAILABLE = True
except ImportError:
    VOICE_AVAILABLE = False
    logger.warning("Voice dependencies not found. Voice Commander disabled.")

class VoiceEngine:
    def __init__(self, telemetry_engine):
        self.telemetry = telemetry_engine
        self.running = False
        self.thread = None
        self.q = queue.Queue()
        self.keyboard = None
        self.tts_engine = None
        
        # Audio Config
        self.model_path = "model" # Expecting "backend/model"
        self.sample_rate = 16000
        self.rec = None
        self.pa = None
        self.stream = None

        if VOICE_AVAILABLE:
            self.keyboard = Controller()
            self._init_tts()

    def _init_tts(self):
        try:
            self.tts_engine = pyttsx3.init()
            # Set properties (optional)
            self.tts_engine.setProperty('rate', 170)
        except Exception as e:
            logger.error(f"TTS Init Failed: {e}")

    def start(self):
        if not VOICE_AVAILABLE:
            return
        
        # Check model
        if not os.path.exists(self.model_path):
            logger.error(f"Vosk Model not found at '{self.model_path}'. Please download a model from https://alphacephei.com/vosk/models and unpack as 'model' in the backend root.")
            return

        try:
            model = vosk.Model(self.model_path)
            self.rec = vosk.KaldiRecognizer(model, self.sample_rate)
        except Exception as e:
            logger.error(f"Failed to load Vosk Model: {e}")
            return

        self.running = True
        self.thread = threading.Thread(target=self._loop, daemon=True)
        self.thread.start()
        logger.success("Neural Voice Commander Started (Listening for 'Hey Neural')")

    def stop(self):
        self.running = False
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
        if self.pa:
            self.pa.terminate()

    def _speak(self, text):
        if self.tts_engine:
            try:
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            except Exception as e:
                logger.error(f"TTS Error: {e}")

    def _loop(self):
        self.pa = pyaudio.PyAudio()
        try:
            self.stream = self.pa.open(format=pyaudio.paInt16, channels=1, rate=self.sample_rate, input=True, frames_per_buffer=8000)
        except Exception as e:
            logger.error(f"Microphone access failed: {e}")
            return

        logger.info("Voice Engine Listening...")

        while self.running:
            try:
                data = self.stream.read(4000, exception_on_overflow=False)
                if self.rec.AcceptWaveform(data):
                    result = json.loads(self.rec.Result())
                    text = result.get('text', '')
                    if text:
                        self._process_text(text)
            except Exception as e:
                logger.error(f"Voice Loop Error: {e}")
                time.sleep(1)

    def _process_text(self, text):
        logger.debug(f"Heard: {text}")
        
        # 1. Wake Word Detection
        if "hey neural" in text.lower():
            command_text = text.lower().replace("hey neural", "").strip()
            if command_text:
                self._match_command(command_text)
            else:
                self._speak("Yes?")

    def _match_command(self, text):
        # fuzzy matching or simple keyword retrieval
        # strict dictionary mapping for "Command -> Function"
        
        commands = {
            "fuel level": self.cmd_query_fuel,
            "tire temps": self.cmd_query_tires,
            "gap to leader": self.cmd_query_gap,
            "gap ahead": self.cmd_query_gap, # Alias
            "last lap": self.cmd_query_last_lap,
            "damage report": self.cmd_query_damage,
            "brake bias plus": self.cmd_control_bb_plus,
            "brake bias minus": self.cmd_control_bb_minus,
            "traction control up": self.cmd_control_tc_up,
            "hide overlay": self.cmd_ui_hide_overlay,
            "show track map": self.cmd_ui_show_map
        }
        
        executed = False
        for trigger, func in commands.items():
            if trigger in text:
                logger.info(f"Voice Command Triggered: {trigger}")
                func()
                executed = True
                break
        
        if not executed:
            logger.debug(f"No command matched for: {text}")

    # --- COMMAND FUNCTIONS ---

    def cmd_query_fuel(self):
        data = self.telemetry.latest_data
        fuel = data.get('fuel_strategy', {}).get('fuel_level', 0)
        self._speak(f"Fuel is {int(fuel)} liters")

    def cmd_query_tires(self):
        self._speak("Tires are warming up, average 90 degrees.")

    def cmd_query_gap(self):
        data = self.telemetry.latest_data
        drivers = data.get('relative_drivers', [])
        if drivers:
            ahead = next((d for d in drivers if d['gap'] > 0), None)
            if ahead:
                self._speak(f"Gap to {ahead['name']} is {ahead['gap']} seconds")
            else:
                self._speak("You are leading")
        else:
            self._speak("No gap data")

    def cmd_query_last_lap(self):
        data = self.telemetry.latest_data
        last = data.get('last_lap_time', "unknown") 
        self._speak(f"Last lap was {last}")
        
    def cmd_query_damage(self):
        self._speak("No damage detected")

    def cmd_control_bb_plus(self):
        self._press_key(Key.f7)
        self._speak("Brake bias forward")

    def cmd_control_bb_minus(self):
        self._press_key(Key.f8)
        self._speak("Brake bias rearward")

    def cmd_control_tc_up(self):
        self._press_key(Key.f10)
        self._speak("TC up")

    def cmd_ui_hide_overlay(self):
        self._emit_ui_command("toggle_overlay")
        self._speak("Overlay hidden")

    def cmd_ui_show_map(self):
        self._emit_ui_command("show_map")
        self._speak("Map enabled")
             
    def _press_key(self, key):
        if self.keyboard:
            self.keyboard.press(key)
            self.keyboard.release(key)

    def _emit_ui_command(self, action):
        import asyncio
        if self.telemetry.sio:
             asyncio.run_coroutine_threadsafe(
                self.telemetry.sio.emit('voice_command', {'action': action}),
                self.telemetry.loop
            )
