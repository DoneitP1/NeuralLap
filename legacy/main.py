from flask import Flask
from flask_socketio import SocketIO
import sqlite3

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

# Database Setup (SQLite)
DB_NAME = "telemetry.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            speed INTEGER,
            throttle REAL,
            brake REAL,
            gear INTEGER,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route("/")
def index():
    return "iRacing Telemetry Backend Running! (SQLite)"

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@socketio.on("send_data")
def handle_send_data(data):
    print(f"Received Data: {data}")

    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        sql = "INSERT INTO telemetry (speed, throttle, brake, gear) VALUES (?, ?, ?, ?)"
        values = (
            data.get("speed", 0),
            data.get("throttle", 0),
            data.get("brake", 0),
            data.get("gear", 0)
        )
        cursor.execute(sql, values)
        conn.commit()
        conn.close()
    except sqlite3.Error as err:
        print(f"SQLite Error: {err}")

    socketio.emit("telemetry_update", data)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5001, debug=True)

