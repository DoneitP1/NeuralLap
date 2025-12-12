import React from 'react';

const InputTelemetry = ({ telemetry }) => {
    if (!telemetry) return null;

    const { throttle, brake, clutch, steering_angle, trail_braking_quality } = telemetry;

    // Convert inputs to percentages (assuming 0-1 range from backend)
    const throttlePct = throttle * 100;
    const brakePct = brake * 100;
    const clutchPct = clutch * 100;

    // Steering: -450 to 450 degrees typically, but here we might get radians or raw
    // Let's assume radians and convert to degrees for rotation
    // Mock sends math.sin(t*0.3) -> -1 to 1. Let's map this to -90 to 90 degrees for visual
    const steeringDeg = steering_angle * 90;

    const trailBrakingPct = trail_braking_quality * 100;

    return (
        <div className="bg-neutral-900/90 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Input Telemetry
            </h3>

            <div className="flex gap-6 items-center justify-center">

                {/* Input Bars Container */}
                <div className="flex gap-3 h-32 items-end">
                    {/* Clutch */}
                    <div className="flex flex-col items-center gap-1 group">
                        <div className="w-4 h-full bg-neutral-800 rounded-full relative overflow-hidden border border-white/5">
                            <div
                                className="absolute bottom-0 w-full bg-blue-500 transition-all duration-75 rounded-b-full group-hover:bg-blue-400"
                                style={{ height: `${clutchPct}%`, willChange: 'height' }}
                            />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400">CL</span>
                    </div>

                    {/* Brake */}
                    <div className="flex flex-col items-center gap-1 group">
                        <div className="w-4 h-full bg-neutral-800 rounded-full relative overflow-hidden border border-white/5">
                            <div
                                className="absolute bottom-0 w-full bg-red-500 transition-all duration-75 rounded-b-full group-hover:bg-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                                style={{ height: `${brakePct}%`, willChange: 'height' }}
                            />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400">BR</span>
                    </div>

                    {/* Throttle */}
                    <div className="flex flex-col items-center gap-1 group">
                        <div className="w-4 h-full bg-neutral-800 rounded-full relative overflow-hidden border border-white/5">
                            <div
                                className="absolute bottom-0 w-full bg-green-500 transition-all duration-75 rounded-b-full group-hover:bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                                style={{ height: `${throttlePct}%`, willChange: 'height' }}
                            />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-neutral-400">TH</span>
                    </div>
                </div>

                {/* Steering Wheel Visualization */}
                <div className="relative w-24 h-24 flex items-center justify-center">
                    {/* Wheel SVG/Div */}
                    <div
                        className="w-20 h-20 rounded-full border-4 border-neutral-600 relative transition-transform duration-75 ease-linear shadow-lg"
                        style={{ transform: `rotate(${steeringDeg}deg)`, willChange: 'transform' }}
                    >
                        {/* Top Center Marker */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-3 bg-red-500 rounded-sm"></div>
                        {/* Spokes */}
                        <div className="absolute top-1/2 left-0 w-full h-1 bg-neutral-700 -translate-y-1/2"></div>
                    </div>
                    <span className="absolute bottom-[-20px] text-[10px] text-neutral-400 uppercase font-bold">Steering</span>
                </div>

                {/* Trail Braking Indicator */}
                <div className="flex flex-col gap-2 w-24">
                    <div className="flex justify-between items-center text-[10px] text-neutral-400 uppercase font-bold">
                        <span>Trail</span>
                        <span className={`${trailBrakingPct > 50 ? 'text-green-400' : 'text-neutral-500'}`}>
                            {trailBrakingPct.toFixed(0)}%
                        </span>
                    </div>
                    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden border border-white/5">
                        <div
                            className={`h-full transition-all duration-75 ${trailBrakingPct > 70 ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]' :
                                trailBrakingPct > 30 ? 'bg-blue-500' : 'bg-neutral-600'
                                }`}
                            style={{ width: `${trailBrakingPct}%` }}
                        />
                    </div>
                    <p className="text-[8px] text-neutral-500 leading-tight">
                        Quality based on brake release vs turn-in
                    </p>
                </div>

            </div>
        </div>
    );
};

export default React.memo(InputTelemetry);
