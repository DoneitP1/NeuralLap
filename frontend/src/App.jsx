import { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Spotter } from './components/Spotter'
import { ARVisuals } from './components/ARVisuals' // NEW
import { GhostOverlay } from './components/GhostOverlay' // NEW
import { DebugPanel } from './components/DebugPanel' // NEW

// Connect to Backend
const socket = io('http://localhost:8000')

function cn(...inputs) {
  return twMerge(clsx(inputs))
}

const StatBox = ({ label, value, unit, color = "text-white", subValue, subLabel }) => (
  <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 min-w-[100px] flex flex-col items-center shadow-lg">
    <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">{label}</span>
    <div className="flex items-baseline gap-1">
      <span className={cn("text-3xl font-black tabular-nums tracking-tighter", color)}>{value}</span>
      {unit && <span className="text-xs text-gray-400 font-medium">{unit}</span>}
    </div>
    {subValue && (
      <div className="mt-1 flex items-center gap-1 border-t border-white/5 pt-1 w-full justify-center">
        <span className="text-[10px] text-gray-400 font-bold">{subLabel}</span>
        <span className="text-sm font-bold text-purple-400 tabular-nums">{subValue}</span>
      </div>
    )}
  </div>
)

const RPMBar = ({ rpm, maxRpm = 9000 }) => {
  const percentage = Math.min((rpm / maxRpm) * 100, 100)
  // Dynamic color: Green -> Yellow -> Red -> Blue (Shift)
  let color = "bg-green-500"
  if (percentage > 70) color = "bg-yellow-400"
  if (percentage > 90) color = "bg-red-600"
  if (percentage >= 98) color = "bg-blue-500 animate-pulse"

  return (
    <div className="w-full h-4 bg-gray-900/80 rounded-full mt-2 overflow-hidden border border-white/5 relative">
      {/* Marks */}
      <div className="absolute inset-0 flex justify-between px-20">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <div key={i} className="w-px h-full bg-white/10" />)}
      </div>
      <div
        className={cn("h-full transition-all duration-75 ease-linear shadow-[0_0_15px_currentColor]", color)}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

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
    predicted_lap: 0, // NEW
    potential_lap: 0, // NEW
    timestamp: 0
  })

  useEffect(() => {
    socket.on('connect', () => {
      console.log('Connected to Neural Lap Backend')
    })

    socket.on('telemetry_update', (newData) => {
      setData(newData)
    })

    return () => {
      socket.off('connect')
      socket.off('telemetry_update')
    }
  }, [])

  // Format seconds to 1:23.4
  const formatTime = (sec) => {
    if (!sec) return "0:00.0"
    const m = Math.floor(sec / 60)
    const s = (sec % 60).toFixed(1)
    return `${m}:${s.padStart(4, '0')}`
  }

  return (
    <div className="w-screen h-screen bg-transparent flex flex-col items-center justify-end pb-12 select-none overflow-hidden relative">

      {/* 0. Dev Tools */}
      <DebugPanel socket={socket} />

      {/* 1. AR Layer (Deepest) */}
      <ARVisuals
        brakeBox={data.ar_brake_box}
        apexCorridor={data.ar_apex_corridor}
      />

      {/* 2. Ghost Layer */}
      <GhostOverlay ghost={data.ghost_data} />

      {/* 3. Spotter Layer */}
      <Spotter left={data.spotter_left} right={data.spotter_right} />

      {/* 4. Main HUD (Top) */}
      <div className="relative flex flex-col items-center gap-2 mb-8 scale-110 z-50">
        {/* Added z-50 to keep HUD on top of AR */}


        {/* Top Stats Row */}
        <div className="flex items-center gap-4">
          <StatBox label="SPEED" value={Math.round(data.speed)} unit="KMH" />

          {/* Gear (Center) */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-2xl blur-xl" />
            <span className="relative text-9xl font-black text-white italic tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              {data.gear === 0 ? 'N' : data.gear === -1 ? 'R' : data.gear}
            </span>
            <span className="absolute bottom-2 text-xs font-bold text-gray-500 tracking-[0.3em]">GEAR</span>
          </div>

          <StatBox
            label="LAP TIME"
            value="1:34.2"
            color="text-yellow-400"
            subLabel="PRED"
            subValue={formatTime(data.predicted_lap)}
          />
        </div>

        {/* Potential Lap Badge (Floating) */}
        {data.potential_lap > 0 && (
          <div className="absolute -right-32 top-10 bg-purple-900/80 backdrop-blur border border-purple-500/30 px-3 py-1 rounded-lg flex flex-col items-end shadow-xl">
            <span className="text-[8px] text-purple-300 font-bold tracking-widest uppercase">IDEAL</span>
            <span className="text-xl font-black text-white tabular-nums tracking-tighter">{formatTime(data.potential_lap)}</span>
          </div>
        )}

        {/* RPM Bar */}
        <div className="w-[500px]">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1 px-1">
            <span>RPM</span>
            <span>{Math.round(data.rpm)}</span>
          </div>
          <RPMBar rpm={data.rpm} />
        </div>

        {/* Input Traces */}
        <div className="flex gap-2 w-[500px] mt-2">
          <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-75" style={{ width: `${data.brake * 100}%` }} />
          </div>
          <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-75" style={{ width: `${data.throttle * 100}%` }} />
          </div>
        </div>

      </div>
    </div>
  )
}

export default App
  ```
