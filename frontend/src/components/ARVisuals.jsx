import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function ARVisuals({ brakeBox, apexCorridor }) {

    return (
        <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{
                perspective: '800px',
            }}
        >

            {/* 1. Dynamic Brake Box (The Red Wall) */}
            {brakeBox && brakeBox.active && (
                <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center transition-transform duration-75 ease-linear"
                    style={{
                        // Simulate approach: As distance drops (50m -> 0m), Scale goes (0.5 -> 2.0)
                        transform: `scale(${2.5 - (brakeBox.distance / 100)}) translateZ(0)`,
                        opacity: brakeBox.urgency
                    }}
                >
                    {/* The Box Frame */}
                    <div className="w-[400px] h-[250px] border-[6px] border-red-600/80 rounded-xl shadow-[0_0_50px_rgba(220,38,38,0.6)] flex items-center justify-center bg-red-900/10 backdrop-blur-[2px]">
                        <div className="text-red-500 font-black text-6xl tracking-tighter animate-pulse">
                            BRAKE
                        </div>
                        <div className="absolute -bottom-12 text-white font-bold text-xl bg-black/50 px-3 py-1 rounded">
                            {Math.round(brakeBox.distance)}m
                        </div>
                    </div>
                </div>
            )}

            {/* 2. Apex Corridor (Virtual Path) */}
            {apexCorridor && apexCorridor.active && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* 
                Simulate a 3D Floor Path with perspective rotation.
                If turning right, we rotate slightly.
             */}
                    <div
                        className="w-[300px] h-[800px] absolute bottom-0 
                           bg-gradient-to-t from-green-500/30 to-transparent
                           border-x-4 border-green-500/50"
                        style={{
                            transform: `rotateX(60deg) ${apexCorridor.curve_direction === 'right' ? 'skewX(-20deg) translateX(100px)' : 'skewX(20deg) translateX(-100px)'} translateY(200px)`,
                            transformOrigin: 'bottom center'
                        }}
                    >
                        {/* Chevron Markers on the detailed floor */}
                        <div className="w-full h-full flex flex-col justify-evenly items-center opacity-50">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-32 h-4 bg-green-400/80 clip-path-chevron" />
                            ))}
                        </div>
                    </div>

                    {/* Floating Text */}
                    <div className="absolute top-1/3 text-green-400 font-bold text-2xl animate-bounce shadow-black drop-shadow-lg">
                        HIT APEX &gt;&gt;&gt;
                    </div>
                </div>
            )}

        </div>
    );
}
