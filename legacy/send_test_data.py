import time
import random
import socketio

sio = socketio.Client()

@sio.event
def connect():
    print("Connected to server")

@sio.event
def telemetry_update(data):
    print(f"Server echoed: {data}")

@sio.event
def disconnect():
    print("Disconnected from server")

def send_data():
    try:
        sio.connect('http://localhost:5001')
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    while True:
        data = {
            "speed": random.randint(0, 300),
            "throttle": random.random(),
            "brake": random.random(),
            "gear": random.randint(1, 8)
        }
        print(f"Sending: {data}")
        sio.emit('send_data', data)
        time.sleep(1)

if __name__ == "__main__":
    send_data()
