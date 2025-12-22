import { useRef } from 'react'

export const BioWidget = ({ bio }) => {
    if (!bio) return null

    const { heart_rate, stress_level, connected, device } = bio

    // Color logic
    let color = "text-blue-400"
    let heartbeatSpeed = "animate-pulse" // default speed

    if (heart_rate > 100) { color = "text-green-400"; heartbeatSpeed = "animate-pulse" } // 1s
    if (heart_rate > 130) { color = "text-orange-400"; heartbeatSpeed = "animate-ping" } // faster?
    if (heart_rate > 160) { color = "text-red-500"; heartbeatSpeed = "animate-bounce" }

    // Custom inline style for precise BPM animation would be better, but Tailwind classes are requested.
    // Let's stick to simple pulse but maybe color intensity is key.

    return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-3 min-w-[140px] flex flex-col items-center shadow-lg relative overflow-hidden group">
            {/* Status Dot */}
            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-500'}`} title={device || "Mock Data"}></div>

            <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase mb-1">BIOMETRICS</span>

            <div className="flex items-center gap-3">
                <svg className={`w-6 h-6 ${color} ${heartbeatSpeed}`} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                <div className="flex items-baseline">
                    <span className={`text-3xl font-black tabular-nums tracking-tighter ${color}`}>{heart_rate}</span>
                    <span className="text-xs text-gray-400 font-medium ml-1">BPM</span>
                </div>
            </div>

            <div className="mt-2 w-full text-center border-t border-white/5 pt-1">
                <span className={`text-xs font-bold ${stress_level === 'CRITICAL' ? 'text-red-500 animate-pulse' : 'text-gray-400'}`}>
                    STRESS: <span className="text-white">{stress_level}</span>
                </span>
            </div>
        </div>
    )
}
