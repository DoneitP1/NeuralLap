import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import InputTelemetry from './components/InputTelemetry'
import RadarOverlay from './components/RadarOverlay'
import { RelativeTable } from './components/RelativeTable'
import Dashboard from './components/Dashboard' // NEW
import Welcome from './components/Welcome' // NEW
import VRMenu from './components/VRMenu' // NEW
import AnalysisDashboard from './components/AnalysisDashboard' // NEW
import StrategyPanel from './components/StrategyPanel' // NEW
import Marketplace from './components/Community/Marketplace' // NEW
import Leagues from './components/Community/Leagues' // NEW
import MobileCompanion from './components/Mobile/MobileCompanion' // NEW
import AmbientLighting from './components/Hardware/AmbientLighting' // NEW
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './components/Login'
import Register from './components/Register'

// Connect to Backend
// Connect to Backend (Dynamic Host)
const query = new URLSearchParams(window.location.search)
const host = query.get('host') || 'localhost'
const socket = io(`http://${host}:8000`)

function App() {
  const [data, setData] = useState({
    speed: 0,
    rpm: 0,
    gear: 0,
    throttle: 0,
    brake: 0,
    spotter_left: false,
    spotter_right: false,
    ar_brake_box: null,
    ar_apex_corridor: null,
    ghost_data: null,
    predicted_lap: 0,
    potential_lap: 0,
    coach_msg: null,
    relative_drivers: [],
    radar_cars: [],
    setup_suggestion: null,
    ar_lift_coast: null, // Added for ARVisuals
    strategy: null, // Added for StrategyPanel
    hardware: null, // Added for Hardware Integration
    timestamp: 0
  })

  // Report State
  const [neuralReport, setNeuralReport] = useState(null)

  // Performance Mode State
  const [perfMode, setPerfMode] = useState(false)

  // Toggle Perf Mode on 'P' key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'P' && e.shiftKey) {
        setPerfMode(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Apply Perf Mode Class
  useEffect(() => {
    if (perfMode) {
      document.body.classList.add('perf-mode')
    } else {
      document.body.classList.remove('perf-mode')
    }
  }, [perfMode])

  // Text-To-Speech Helper
  const speak = (text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  useEffect(() => {
    socket.on('telemetry_update', (newData) => {
      setData(newData)
      if (newData.coach_msg) {
        speak(newData.coach_msg)
      }
    })

    socket.on('neural_report', (report) => {
      setNeuralReport(report)
    })

    return () => {
      socket.off('telemetry_update')
      socket.off('neural_report')
    }
  }, [])

  // --- ROUTING LOGIC ---
  // Query params already parsed above for host
  const viewMode = query.get('view') // 'radar', 'inputs', 'relative', 'fuel'
  const appMode = query.get('mode') // 'desktop', 'vr'

  // Customization Params
  const scale = parseFloat(query.get('scale')) || 1.0
  // Default to black for visibility unless explicitly transparent
  const bgMode = query.get('bg') || 'black'
  const bgClass = bgMode === 'transparent' ? 'bg-transparent' : bgMode === 'dark' ? 'bg-neutral-900' : 'bg-black'

  console.log("App Mode:", appMode, "Background:", bgMode, "Class:", bgClass);


  // 1. STANDALONE WIDGET VIEWS (Priority)
  // These are for VR windows popped out from the launcher
  if (viewMode === 'radar') {
    return (
      <div className={`w-screen h-screen flex items-center justify-center overflow-hidden ${bgClass}`}>
        <div style={{ transform: `scale(${scale})` }}>
          <RadarOverlay cars={data.radar_cars} />
        </div>
      </div>
    )
  }

  if (viewMode === 'inputs') {
    return (
      <div className={`w-screen h-screen flex items-center justify-center overflow-hidden ${bgClass}`}>
        <div style={{ transform: `scale(${scale})` }}>
          <InputTelemetry telemetry={data} />
        </div>
      </div>
    )
  }

  if (viewMode === 'relative') {
    return (
      <div className={`w-screen h-screen overflow-hidden ${bgClass}`}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          <RelativeTable drivers={data.relative_drivers} />
        </div>
      </div>
    )
  }

  // 2. APP MODES
  if (appMode === 'desktop') {
    return (
      <div className={`w-screen h-screen overflow-hidden ${bgClass}`}>
        <AmbientLighting lightEvent={data.hardware?.light} />
        <Dashboard data={data} socket={socket} neuralReport={neuralReport} setNeuralReport={setNeuralReport} />
        <AuthOverlay />
      </div>
    )
  }

  if (appMode === 'vr') {
    return (
      <>
        <VRMenu />
        <AuthOverlay />
      </>
    )

  }

  if (appMode === 'analysis') {
    return <AnalysisDashboard />
  }

  if (appMode === 'marketplace') {
    return (
      <div className="w-screen h-screen bg-neutral-900 flex justify-center">
        <div className="w-full max-w-6xl">
          <Marketplace />
        </div>
      </div>
    )
  }

  if (appMode === 'leagues') {
    return (
      <div className="w-screen h-screen bg-neutral-900 flex justify-center">
        <div className="w-full max-w-6xl">
          <Leagues />
        </div>
      </div>
    )
  }

  if (appMode === 'mobile') {
    // Pass data to mobile
    return <MobileCompanion data={data} />
  }

  // 3. LANDING PAGE (Default)
  return (
    <>
      <Welcome />
      <AuthOverlay />
    </>
  )
}

function AuthOverlay() {
  const { user } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // If logged in, maybe show a small profile badge or nothing
  if (user) return null;

  // If not logged in, show login button (or handle via Welcome)
  // For now, let's put a "Pilot Login" button in bottom right
  return (
    <>
      {!showLogin && !showRegister && (
        <button
          onClick={() => setShowLogin(true)}
          className="fixed bottom-4 right-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full text-sm backdrop-blur-md border border-white/10 transition-all z-50">
          Pilot Login
        </button>
      )}

      {showLogin && (
        <Login
          onSwitchToRegister={() => { setShowLogin(false); setShowRegister(true); }}
          onClose={() => setShowLogin(false)}
        />
      )}

      {showRegister && (
        <Register
          onSwitchToLogin={() => { setShowRegister(false); setShowLogin(true); }}
          onClose={() => setShowRegister(false)}
        />
      )}
    </>
  )
}

export default function AppWrapper() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  )
}


