import React, { useState, useEffect } from 'react';

const NeuralReport = ({ report, onClose }) => {
    if (!report) return null;

    // Render a simple SVG line chart
    const renderChart = (dataYou, dataRef, colorYou, colorRef) => {
        // Normalize to 100x50 box
        const maxVal = Math.max(...dataYou, ...dataRef);
        const minVal = Math.min(...dataYou, ...dataRef);
        const range = maxVal - minVal || 1;

        const pointsYou = dataYou.map((val, i) =>
            `${(i / (dataYou.length - 1)) * 100},${50 - ((val - minVal) / range) * 50}`
        ).join(' ');

        const pointsRef = dataRef.map((val, i) =>
            `${(i / (dataRef.length - 1)) * 100},${50 - ((val - minVal) / range) * 50}`
        ).join(' ');

        return (
            <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                <polyline points={pointsRef} fill="none" stroke={colorRef} strokeWidth="2" strokeDasharray="4" opacity="0.5" />
                <polyline points={pointsYou} fill="none" stroke={colorYou} strokeWidth="2" />
            </svg>
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in p-8">
            <div className="bg-neutral-900 border border-purple-500/30 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col relative animate-slide-up">

                {/* Header */}
                <div className="bg-gradient-to-r from-purple-900 to-black p-6 flex justify-between items-end border-b border-white/10">
                    <div>
                        <h2 className="text-3xl font-black italic text-white tracking-tighter">NEURAL REPORT</h2>
                        <p className="text-purple-300 font-bold uppercase tracking-widest text-sm">Post-Lap Analysis</p>
                    </div>
                    <div className="text-right">
                        <span className="block text-xs text-gray-400 uppercase">Lap Time</span>
                        <span className="text-4xl font-mono font-bold text-white">{report.lap_time}</span>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-12 gap-6 p-8 h-full">

                    {/* Left Column: Score */}
                    <div className="col-span-4 flex flex-col items-center justify-center p-4 bg-white/5 rounded-xl border border-white/5">
                        <div className="relative w-40 h-40 flex items-center justify-center">
                            <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#333" strokeWidth="8" />
                                <circle
                                    cx="50" cy="50" r="45" fill="none" stroke="#a855f7" strokeWidth="8"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (283 * report.pilot_score / 100)}
                                    className="transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-white">{report.pilot_score}</span>
                                <span className="text-xs text-gray-400 uppercase font-bold">Pilot Score</span>
                            </div>
                        </div>
                    </div>

                    {/* Center Column: Mistakes */}
                    <div className="col-span-8 space-y-4">
                        <h3 className="text-lg font-bold text-purple-400 uppercase tracking-wider mb-2">Top 3 Time Losses</h3>
                        {report.mistakes.map((m, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3 flex justify-between items-center border-l-4 border-red-500">
                                <div>
                                    <span className="font-bold text-white block text-lg">{m.corner}</span>
                                    <span className="text-sm text-gray-400">{m.feedback}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-2xl font-bold text-red-400">+{m.time_lost}s</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Bottom Row: Charts */}
                    <div className="col-span-12 mt-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Speed Trace vs Reference (Ghost)</h3>
                        <div className="w-full h-32 bg-black/40 rounded-lg p-2 border border-white/5">
                            {renderChart(report.traces.speed_you, report.traces.speed_ref, '#ef4444', '#ffffff')}
                        </div>
                        <div className="flex justify-center gap-6 mt-2 text-xs font-bold uppercase">
                            <div className="flex items-center gap-2"><span className="w-3 h-1 bg-red-500"></span> You</div>
                            <div className="flex items-center gap-2"><span className="w-3 h-1 bg-white/50 dashed border-b border-white"></span> Reference</div>
                        </div>
                    </div>

                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-black/60 border-t border-white/10 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white text-black font-black uppercase tracking-wider hover:bg-gray-200 transition-colors rounded"
                    >
                        Continue Session
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NeuralReport;
