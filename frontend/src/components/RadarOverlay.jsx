import React from 'react';

const RadarOverlay = ({ cars }) => {
    if (!cars || cars.length === 0) return null;

    // Radar Settings
    // Scale: 1 meter = X pixels
    const SCALE = 8;
    // Max dist to show: 20 meters -> 160px radius
    const MAX_DIST = 30;
    const CENTER = 100; // SVG ViewBox center (100, 100) -> 200x200 box

    // Helper to map meters to SVG coordinates
    // X: + is Right, - is Left
    // Y: + is Ahead, - is Behind (Standard Carthesian vs Screen Y)
    // Screen Y increases downwards. So Ahead (+Y) means smaller Screen Y.
    const mapToSVG = (x, y) => {
        return {
            cx: CENTER + (x * SCALE),
            cy: CENTER - (y * SCALE)
        };
    };

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 rounded-full overflow-hidden w-[300px] h-[300px] bg-black/40 backdrop-blur-sm border border-white/5 pointer-events-none flex items-center justify-center">
            {/* Radar SVG */}
            <svg viewBox="0 0 200 200" className="w-full h-full opacity-90">
                {/* Background Rings - Distance Markers */}
                <circle cx="100" cy="100" r={5 * SCALE} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r={10 * SCALE} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r={20 * SCALE} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

                {/* Player Marker (Center) */}
                <path d="M100 92 L106 108 L100 104 L94 108 Z" fill="#00ff00" />

                {/* Opponent Cars */}
                {cars.map(car => {
                    const { cx, cy } = mapToSVG(car.x, car.y);
                    const isOutOfRange = Math.abs(car.y) > MAX_DIST || Math.abs(car.x) > MAX_DIST;
                    if (isOutOfRange) return null;

                    return (
                        <g key={car.id} style={{ transition: 'all 0.1s linear', willChange: 'transform' }}>
                            {/* Glow */}
                            <circle
                                cx={cx} cy={cy} r="6"
                                fill={car.class_color === 'red' ? 'rgba(239,68,68,0.5)' : 'rgba(59,130,246,0.5)'}
                                className="blur-[2px]"
                            />
                            {/* Core Dot/Arrow */}
                            {/* Simple Dot for now, easier to animate smoothly */}
                            <circle
                                cx={cx} cy={cy} r="3"
                                fill="white"
                            />
                            {/* Optional: Small Label/Arrow if we had heading */}
                        </g>
                    );
                })}
            </svg>

            {/* Central Label (Optional) */}
            <div className="absolute bottom-2 text-[10px] text-white/30 font-mono tracking-widest uppercase">
                Radar Active
            </div>
        </div>
    );
};

export default React.memo(RadarOverlay);
