import React, { useState, useEffect } from 'react'
import { DragWrapper } from './DragWrapper' // NEW
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Spotter } from './Spotter'
import { ARVisuals } from './ARVisuals'
import { DebugPanel } from './DebugPanel'
import { RelativeTable } from './RelativeTable'
import { FuelStrategy } from './FuelStrategy'
import InputTelemetry from './InputTelemetry'
import RadarOverlay from './RadarOverlay'
import SetupManager from './SetupManager'
import NeuralReport from './NeuralReport'

// --- HELPER COMPONENTS (Moved from App.jsx) ---
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
    let color = "bg-green-500"
    if (percentage > 70) color = "bg-yellow-400"
    if (percentage > 90) color = "bg-red-600"
    if (percentage >= 98) color = "bg-blue-500 animate-pulse"

    return (
        <div className="w-full h-4 bg-gray-900/80 rounded-full mt-2 overflow-hidden border border-white/5 relative">
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

const LapDelta = ({ predicted, potential }) => {
    // Simple placeholder for now, actual delta logic can be added
    return null;
}

// --- MAIN DASHBOARD COMPONENT ---
const Dashboard = ({ data, socket, neuralReport, setNeuralReport }) => {

    // Helper
    const formatTime = (sec) => {
        if (!sec) return "0:00.0"
        const m = Math.floor(sec / 60)
        const s = (sec % 60).toFixed(1)
        return `${m}:${s.padStart(4, '0')}`
    }

    const openWidget = (viewName) => {
        window.open(`/?view=${viewName}&scale=1.0&bg=transparent`, viewName, 'width=400,height=400,frame=false,transparent=true')
    }

    // --- LAYOUT EDITOR STATE ---
    const [editMode, setEditMode] = useState(false)
    const [layout, setLayout] = useState(() => {
        const saved = localStorage.getItem('hud_layout')
        return saved ? JSON.parse(saved) : {}
    })

    const handleLayoutChange = (id, pos) => {
        const newLayout = { ...layout, [id]: pos }
        setLayout(newLayout)
        localStorage.setItem('hud_layout', JSON.stringify(newLayout))
    }

    return (
        <div className="w-screen h-screen bg-transparent flex flex-col items-center justify-end pb-12 select-none overflow-hidden relative fade-in">

            {/* Widget Pop-out Controls */}
            {/* Widget Pop-out Controls & Edit Mode */}
            <div className="absolute top-0 right-0 p-2 flex gap-2 opacity-0 hover:opacity-100 transition-opacity z-50">
                <button onClick={() => setEditMode(!editMode)} className={`p-1 text-xs text-white rounded font-bold ${editMode ? 'bg-red-600' : 'bg-green-600'}`}>
                    {editMode ? 'Lock Layout' : 'Edit Layout'}
                </button>
                <button onClick={() => openWidget('radar')} className="p-1 text-xs bg-slate-800 text-white rounded">Pop Radar</button>
                <button onClick={() => openWidget('inputs')} className="p-1 text-xs bg-slate-800 text-white rounded">Pop Inputs</button>
                <button onClick={() => openWidget('relative')} className="p-1 text-xs bg-slate-800 text-white rounded">Pop Relative</button>
            </div>

            {/* 0. Top Bar / Info */}
            <div className="absolute top-10 left-10 flex flex-col gap-2">
                <div className="text-4xl font-black italic text-white drop-shadow-lg">
                    {Math.round(data.speed)} <span className="text-xl text-neutral-400">KMH</span>
                </div>

                <div className="flex gap-4 text-white font-mono text-lg">
                    <span className="bg-neutral-900/50 px-2 rounded">LAP: {Math.floor(data.lap_dist_pct * 100)}%</span>
                    <span className="bg-neutral-900/50 px-2 rounded">GEAR: {data.gear === -1 ? 'R' : data.gear === 0 ? 'N' : data.gear}</span>
                </div>
            </div>

            {/* 0. Dev Tools */}
            <DebugPanel socket={socket} />

            {/* 0.1 Neural Report Modal */}
            <NeuralReport report={neuralReport} onClose={() => setNeuralReport(null)} />

            {/* 0.6 Fuel Strategy */}
            <FuelStrategy fuelData={data.fuel_strategy} />

            {/* 0.7 Setup Manager */}
            <SetupManager suggestion={data.setup_suggestion} />

            {/* 1. AR Layer */}
            <ARVisuals
                brakeBox={data.ar_brake_box}
                apexCorridor={data.ar_apex_corridor}
                ghost={data.ghost_data}
            />

            {/* 2. Spotter Arrows */}
            <Spotter left={data.spotter_left} right={data.spotter_right} />

            {/* 3. Main HUD Cluster */}
            <div className="w-full flex flex-col items-center">
                {/* 3.1 RPM Bar */}
                <DragWrapper id="rpm_bar" editMode={editMode} layout={layout} onLayoutChange={handleLayoutChange} className="w-[800px]">
                    <RPMBar rpm={data.rpm} maxRpm={8000} />
                </DragWrapper>

                {/* 3.4 Input Traces */}
                <DragWrapper id="inputs" editMode={editMode} layout={layout} onLayoutChange={handleLayoutChange} className="mt-2">
                    <div className="w-[600px] flex justify-center">
                        <InputTelemetry telemetry={data} />
                    </div>
                </DragWrapper>
            </div>

            {/* 3.5 Radar Overlay (Absolute-ish but draggable) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <div className="pointer-events-auto">
                    <DragWrapper id="radar" editMode={editMode} layout={layout} onLayoutChange={handleLayoutChange}>
                        <RadarOverlay cars={data.radar_cars} />
                    </DragWrapper>
                </div>
            </div>

            {/* 4. Lap Time Stats (Floating Right of HUD) */}
            <div className="absolute bottom-32 right-20 flex flex-col gap-2 pointer-events-none">
                <div className="pointer-events-auto">
                    <DragWrapper id="lap_stats" editMode={editMode} layout={layout} onLayoutChange={handleLayoutChange}>
                        <div className="flex flex-col gap-2">
                            <StatBox
                                label="LAP TIME"
                                value="1:34.2"
                                color="text-yellow-400"
                                subLabel="PRED"
                                subValue={formatTime(data.predicted_lap)}
                            />
                            {
                                data.potential_lap > 0 && (
                                    <div className="bg-purple-900/80 backdrop-blur border border-purple-500/30 px-3 py-1 rounded-lg flex flex-col items-center shadow-xl mt-2">
                                        <span className="text-[8px] text-purple-300 font-bold tracking-widest uppercase">IDEAL</span>
                                        <span className="text-xl font-black text-white tabular-nums tracking-tighter">{formatTime(data.potential_lap)}</span>
                                    </div>
                                )
                            }
                        </div>
                    </DragWrapper>
                </div>
            </div>

        </div>
    )
}

export default Dashboard
