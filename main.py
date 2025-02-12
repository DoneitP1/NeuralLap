from flask import Flask
from flask_socketio import SocketIO
import mysql.connector
import eventlet

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="password",
    database="iracing_telemetry"
)
cursor = db.cursor()

@app.route("/")
def index():
    return "iRacing Telemetry Backend Running!"

@socketio.on("connect")
def handle_connect():
    print("Client connected")

@socketio.on("send_data")
def handle_send_data(data):
    print(f"Received Data: {data}")

    sql = "INSERT INTO telemetry (speed, throttle, brake, gear) VALUES (%s, %s, %s, %s)"
    values = (data["speed"], data["throttle"], data["brake"], data["gear"])

    cursor.execute(sql, values)
    db.commit()

    socketio.emit("telemetry_update", data)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
