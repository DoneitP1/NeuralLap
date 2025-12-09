import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function GhostOverlay({ ghost }) {
    if (!ghost || !ghost.active) return null;

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ perspective: '600px' }}>

            {/* Ghost Car Container */}
            <div
                className="absolute left-1/2 bottom-[20%] -translate-x-1/2 transition-transform duration-100 ease-linear"
                style={{
                    // Simulate distance: Scale down as it gets further
                    // relative_distance: 0m (near) -> 20m (far)
                    // scale: 1.0 -> 0.3
                    // translateY: moves up screen as it gets farther
                    transform: `
                translateX(${ghost.lane_offset * 50}px)
                translateY(-${ghost.relative_distance * 15}px)
                scale(${Math.max(0.2, 1 - (ghost.relative_distance / 30))})
            `
                }}
            >
                {/* Ghost Visual */}
                <div className={cn(
                    "relative w-64 h-32 flex flex-col items-center justify-end",
                    ghost.type === 'error_correction' ? "opacity-60" : "opacity-40"
                )}>

                    {/* Label */}
                    <div className={cn(
                        "mb-2 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg backdrop-blur-sm",
                        ghost.type === 'error_correction' ? "bg-cyan-500/80 text-black" : "bg-green-500/80 text-black"
                    )}>
                        {ghost.type === 'error_correction' ? 'Ideal Line' : 'Overtake'}
                    </div>

                    {/* Car Wireframe (Simple Box for now, maybe Replace with SVG later) */}
                    <div className={cn(
                        "w-full h-16 rounded-t-xl border-t-4 border-x-2 shadow-[0_0_30px_currentColor]",
                        ghost.type === 'error_correction' ? "bg-cyan-500/10 border-cyan-400 text-cyan-500" : "bg-green-500/10 border-green-400 text-green-500"
                    )}>
                        {/* Rear Lights */}
                        <div className="absolute bottom-2 w-full flex justify-between px-4">
                            <div className="w-8 h-2 bg-red-600 blur-[2px]" />
                            <div className="w-8 h-2 bg-red-600 blur-[2px]" />
                        </div>
                    </div>

                    {/* Delta Text */}
                    <div className="absolute -right-20 top-1/2 font-mono font-bold text-xl text-white">
                        {ghost.speed_diff > 0 ? '+' : ''}{Math.round(ghost.speed_diff)} km/h
                    </div>
                </div>
            </div>

        </div>
    );
}
