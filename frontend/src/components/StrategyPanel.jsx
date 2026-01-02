import React, { useState, useEffect } from 'react';

export function StrategyPanel({ strategyData }) {
    if (!strategyData) return null;

    const { tire_prediction, pit_alert } = strategyData;

    // Draggable State (Simplified for MVP, fixed text for now)
    return (
        <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl w-64 animate-fade-in flex flex-col gap-4">

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

// Wrapper to handle data fetching if not passed directly via props, or augment props
export default function StrategyPanelWrapper({ strategyData: propData }) {
    const [apiData, setApiData] = useState(null);

    useEffect(() => {
        // Poll for strategy updates (supplementing socket data)
        const fetchStrategy = async () => {
            try {
                // Mock session data for now - in real app this comes from Context or Props
                const payload = {
                    laps_completed: 15,
                    total_laps: 50,
                    fuel_level: 10.0,
                    tire_compound: "SOFT",
                    track_temp: 30.0
                };

                const response = await fetch('http://localhost:8000/api/strategy/recommendation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (response.ok) {
                    const result = await response.json();
                    setApiData(result);
                }
            } catch (e) {
                console.error("Strategy Fetch Error", e);
            }
        };

        const interval = setInterval(fetchStrategy, 5000); // Poll every 5s
        fetchStrategy();
        return () => clearInterval(interval);
    }, []);

    const displayData = propData || apiData;

    if (!displayData) return null;

    return <StrategyPanel strategyData={displayData} />;
}
