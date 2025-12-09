import sys
import sys
from PyQt5.QtWidgets import QApplication, QWidget, QVBoxLayout, QLabel
from PyQt5.QtCore import QThread, pyqtSignal


import socketio

class TelemetryClient(QThread):
    data_received = pyqtSignal(dict)

    def run(self):
        sio = socketio.Client()

        @sio.event
        def connect():
            print("Frontend connected to server")

        @sio.event
        def telemetry_update(data):
            self.data_received.emit(data)

        @sio.event
        def disconnect():
            print("Frontend disconnected")

        try:
            sio.connect('http://localhost:5001')
            sio.wait()
        except Exception as e:
            print(f"Connection failed: {e}")


class MainWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("iRacing Telemetry")
        self.resize(400, 200)


        self.speed_label = QLabel("Speed: 0 km/h")
        self.gear_label = QLabel("Gear: N")
        self.throttle_label = QLabel("Throttle: 0%")
        self.brake_label = QLabel("Brake: 0%")

        # Layout
        layout = QVBoxLayout()
        layout.addWidget(self.speed_label)
        layout.addWidget(self.gear_label)
        layout.addWidget(self.throttle_label)
        layout.addWidget(self.brake_label)
        self.setLayout(layout)


        self.client = TelemetryClient()
        self.client.data_received.connect(self.update_telemetry)
        self.client.start()

    def update_telemetry(self, data):
        self.speed_label.setText(f"Speed: {data.get('speed', 0)} km/h")
        self.gear_label.setText(f"Gear: {data.get('gear', 'N')}")
        self.throttle_label.setText(f"Throttle: {data.get('throttle', 0)*100:.1f}%")
        self.brake_label.setText(f"Brake: {data.get('brake', 0)*100:.1f}%")

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())