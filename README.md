# NeuralLap - iRacing Telemetry System

**NeuralLap** is a real-time telemetry analysis tool for iRacing, providing live data visualization, post-race insights, and AI-driven performance evaluation.

## Features
- 📡 **Real-time telemetry tracking** via WebSocket.
- 🏎 **Data visualization** for speed, throttle, braking, and gear shifts.
- 📊 **MySQL integration** for telemetry data storage.
- 🤖 **AI-powered analysis** to detect racing errors and provide recommendations.
- 🎥 **Video processing** using OpenCV to highlight mistakes visually.

## Technologies Used
- **Backend:** Flask + WebSocket (Flask-SocketIO)
- **Database:** MySQL
- **Frontend:** C++ with Qt
- **Machine Learning:** Scikit-Learn
- **Video Processing:** OpenCV

## Installation
### 1️⃣ Clone the Repository
```bash
git clone https://github.com/yourusername/NeuralLap.git
cd NeuralLap
```

### 2️⃣ Install Dependencies
```bash
pip install flask flask-socketio eventlet mysql-connector-python opencv-python scikit-learn
```

### 3️⃣ Set Up MySQL Database
```sql
CREATE DATABASE iracing_telemetry;
USE iracing_telemetry;

CREATE TABLE telemetry (
    id INT AUTO_INCREMENT PRIMARY KEY,
    speed INT,
    throttle FLOAT,
    brake FLOAT,
    gear INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4️⃣ Run the Backend Server
```bash
python backend/app.py
```

### 5️⃣ Start Sending Telemetry Data (For Testing)
```bash
python backend/send_test_data.py
```

## Future Enhancements
- 📌 **Mobile app integration** for remote telemetry analysis.
- 📌 **Advanced AI models** for race strategy recommendations.
- 📌 **Multi-user support** and **cloud storage** for long-term data logging.

## Contributing
Feel free to contribute to **NeuralLap**! Open an issue or submit a pull request to suggest improvements.

## License
**MIT License** - see the [LICENSE](LICENSE) file for details.

🚀 **Happy Racing!**
```

