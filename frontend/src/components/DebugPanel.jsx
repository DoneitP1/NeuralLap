import React from 'react';
import { io } from 'socket.io-client'

export function DebugPanel({ socket }) {

    // Command Helper
    const send = (cmd) => {
        if (socket) socket.emit('debug_command', { type: cmd })
    }

    return (
        <div
            className="absolute top-4 left-4 bg-black/90 backdrop-blur-xl border border-white/20 p-4 rounded-xl shadow-2xl z-[100] flex flex-col gap-3 min-w-[200px]"
            style={{ WebkitAppRegion: 'drag' }}
        >
            <div className="flex items-center gap-2 mb-1 border-b border-white/10 pb-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-xs font-mono font-bold text-gray-400">DEV CONTROLS</span>
            </div>

            <div className="flex flex-col gap-2" style={{ WebkitAppRegion: 'no-drag' }}>
                <button
                    onClick={() => send('spawn_ghost')}
                    className="bg-cyan-900/40 hover:bg-cyan-500 hover:text-black border border-cyan-500/50 text-cyan-400 px-3 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider text-left"
                >
                    👻 Spawn Ghost
                </button>

                <button
                    onClick={() => send('trigger_brake')}
                    className="bg-red-900/40 hover:bg-red-500 hover:text-black border border-red-500/50 text-red-400 px-3 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider text-left"
                >
                    🛑 Trigger Brake
                </button>

                <div className="flex gap-2">
                    <button
                        onClick={() => send('trigger_spotter_left')}
                        className="flex-1 bg-yellow-900/40 hover:bg-yellow-500 hover:text-black border border-yellow-500/50 text-yellow-400 px-3 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider text-center"
                    >
                        Left
                    </button>
                    <button
                        onClick={() => send('trigger_spotter_right')}
                        className="flex-1 bg-yellow-900/40 hover:bg-yellow-500 hover:text-black border border-yellow-500/50 text-yellow-400 px-3 py-2 rounded text-xs font-bold transition-all uppercase tracking-wider text-center"
                    >
                        Right
                    </button>
                </div>
            </div>

            <div className="mt-2 text-[10px] text-gray-600 font-mono">
                * Click to force event
            </div>
        </div>
    )
}
