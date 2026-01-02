import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function FuelStrategy({ fuelData }) {


    if (!fuelData) return null;

    return (
        <div
            className={cn(
                "bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl w-48 select-none transition-shadow",
                fuelData.box_this_lap && "border-red-500 shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-pulse"
            )}
        >
            {/* Grip Handle */}
            <div className="absolute top-2 right-2 flex gap-0.5 opacity-20 pointer-events-none">
                <div className="w-1 h-3 bg-white rounded-full"></div>
                <div className="w-1 h-3 bg-white rounded-full"></div>
            </div>

            <div className="text-[10px] font-bold text-gray-400 mb-3 tracking-widest uppercase border-b border-white/10 pb-1">
                FUEL STRATEGY
            </div>

            <div className="flex flex-col gap-3 pointer-events-none">

                {/* Fuel Level */}
                <div className="flex justify-between items-end">
                    <span className="text-xs text-gray-400">LEVEL</span>
                    <div className="text-right">
                        <span className={cn("text-2xl font-black tabular-nums tracking-tighter",
                            fuelData.fuel_level < 5 ? "text-red-500" : "text-white"
                        )}>
                            {fuelData.fuel_level.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-gray-500 ml-1">L</span>
                    </div>
                </div>

                {/* Consumption */}
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">USAGE</span>
                    <span className="font-bold text-gray-300">{fuelData.cons_per_lap} L/Lap</span>
                </div>

                {/* Remaining Laps */}
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">LAPS LEFT</span>
                    <span className="font-bold text-white">{fuelData.laps_remaining}</span>
                </div>

                <div className="h-px bg-white/10 my-1" />

                {/* Suggestion */}
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-orange-400 uppercase tracking-wider">STRATEGY CALL</span>
                    {fuelData.box_this_lap ? (
                        <div className="bg-red-600/20 border border-red-500 text-red-100 px-2 py-1.5 rounded text-center text-xs font-black animate-none">
                            BOX BOX (+{Math.ceil(fuelData.fuel_to_add)}L)
                        </div>
                    ) : (
                        <div className="text-xs text-green-400 font-bold flex justify-between">
                            <span>STAY OUT</span>
                            <span>Target: +{Math.ceil(fuelData.fuel_to_add)}L</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
