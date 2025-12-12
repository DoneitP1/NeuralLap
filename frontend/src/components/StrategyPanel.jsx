import React, { useState, useEffect } from 'react';

export function StrategyPanel({ strategyData }) {
    if (!strategyData) return null;

    const { tire_prediction, pit_alert } = strategyData;

    // Draggable State (Simplified for MVP, fixed text for now)
    return (
        <div className="absolute top-32 left-10 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl w-64 animate-fade-in flex flex-col gap-4">

            {/* Header */}
            <div className="text-[10px] font-bold text-gray-500 tracking-widest uppercase border-b border-white/10 pb-1 flex justify-between">
                <span>RACE STRATEGIST</span>
                <span className="text-cyan-500">AI ACTIVE</span>
            </div>

            {/* 1. Tire Prediction */}
            <div className="flex flex-col gap-1">
                <span className="text-[9px] text-gray-400 font-bold uppercase">TIRE PREDICTION (+5 Laps)</span>
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">NOW</span>
                        <span className="text-xl font-bold text-white tabular-nums">{tire_prediction.current_psi} <span className="text-sm text-gray-600">psi</span></span>
                    </div>

                    {/* Trend Arrow */}
                    <div className="flex flex-col items-center">
                        <span className="text-2xl text-yellow-500">
                            {tire_prediction.trend_direction === 'UP' ? '↗' : tire_prediction.trend_direction === 'DOWN' ? '↘' : '→'}
                        </span>
                        <span className="text-[8px] text-yellow-500 font-bold">{tire_prediction.trend_direction}</span>
                    </div>

                    <div className="flex flex-col items-end">
                        <span className="text-xs text-gray-500">PREDICTED</span>
                        <span className="text-xl font-bold text-yellow-400 tabular-nums">{tire_prediction.predicted_psi} <span className="text-sm text-gray-600">psi</span></span>
                    </div>
                </div>
            </div>

            <div className="h-px bg-white/10" />

            {/* 2. Pit Window Alert */}
            {pit_alert ? (
                <div className="bg-red-900/40 border border-red-500/50 rounded-lg p-3 animate-pulse">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-500 font-bold text-lg">⚠️ ALERT</span>
                    </div>
                    <span className="text-white font-bold text-sm uppercase">{pit_alert}</span>
                </div>
            ) : (
                <div className="flex items-center gap-2 opacity-50">
                    <span className="text-green-500">✓</span>
                    <span className="text-xs text-gray-400">Pit window optimal. No threats.</span>
                </div>
            )}

        </div>
    );
}

export default StrategyPanel;
