import React, { useEffect, useState } from 'react';
import DriverDNA from './DriverDNA';

const AnalysisDashboard = () => {
    const [weaknesses, setWeaknesses] = useState([]);
    const [proData, setProData] = useState(null);

    useEffect(() => {
        // Fetch Weaknesses
        fetch('http://localhost:8000/api/analysis/weaknesses')
            .then(res => res.json())
            .then(data => setWeaknesses(data))
            .catch(err => console.error(err));

        // Fetch Pro Data
        fetch('http://localhost:8000/api/analysis/pro-comparison')
            .then(res => res.json())
            .then(data => setProData(data))
            .catch(err => console.error(err));
    }, []);

    const goHome = () => {
        window.location.search = "";
    };

    return (
        <div className="w-screen h-screen bg-neutral-950 text-white overflow-hidden flex flex-col items-center animate-fade-in relative">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(6,182,212,0.1)_0%,_rgba(0,0,0,0.8)_70%)] pointer-events-none" />

            {/* Header */}
            <header className="w-full max-w-6xl p-8 flex justify-between items-center z-10 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-black italic">DRIVER<span className="text-cyan-400">ANALYSIS</span></h1>
                    <p className="text-gray-500 font-mono text-sm tracking-widest">AI PERFORMANCE REVIEW v2.0</p>
                </div>
                <button onClick={goHome} className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded text-xs font-bold transition-colors">
                    EXIT TO MAIN MENU
                </button>
            </header>

            {/* Content Grid */}
            <div className="flex-1 w-full max-w-6xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8 z-10 overflow-y-auto">

                {/* 1. Driver DNA (Left Column) */}
                <div className="flex flex-col gap-4">
                    <h2 className="text-lg font-bold text-gray-400 border-l-4 border-cyan-500 pl-3">YOUR DNA</h2>
                    <DriverDNA />

                    <div className="bg-neutral-900/50 p-4 rounded-xl border border-white/5 mt-4">
                        <h4 className="text-cyan-400 font-bold text-sm mb-2">AI COACH NOTE</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Your driving style suggests high confidence in high-speed corners but slight inconsistency in braking zones. Focus on smoother initial brake application.
                        </p>
                    </div>
                </div>

                {/* 2. Pro Comparison (Middle Column - Wide) */}
                <div className="col-span-1 md:col-span-2 flex flex-col gap-6">

                    {/* Weakness Section */}
                    <div>
                        <h2 className="text-lg font-bold text-gray-400 border-l-4 border-red-500 pl-3 mb-4">CRITICAL WEAKNESSES</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {weaknesses.map((w, i) => (
                                <div key={i} className="bg-neutral-900/80 border border-red-500/20 p-4 rounded-xl hover:border-red-500/50 transition-colors group">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="bg-red-900/30 text-red-400 text-[10px] font-bold px-2 py-1 rounded">{w.corner}</span>
                                        <span className="text-red-400 font-bold">-{w.time_loss}s</span>
                                    </div>
                                    <h3 className="text-white font-bold text-sm mb-1">{w.reason}</h3>
                                    <p className="text-gray-500 text-xs group-hover:text-gray-300 transition-colors">"{w.recommendation}"</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pro Trace Graph (Simple SVG Mock) */}
                    <div className="flex-1 bg-neutral-900/40 border border-white/5 rounded-2xl p-6 relative flex flex-col">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-gray-400 border-l-4 border-purple-500 pl-3">PRO COMPARISON</h2>
                            <div className="flex gap-4 text-xs font-bold">
                                <span className="text-cyan-400">YOU</span>
                                <span className="text-purple-500">MAX VERSTAPPEN</span>
                            </div>
                        </div>

                        {/* Comparison Graph Area */}
                        <div className="flex-1 relative w-full h-full min-h-[200px] flex items-end">
                            {/* Simple bars for now to represent delta over a lap */}
                            {proData && proData.trace_you.map((val, i) => (
                                <div key={i} className="flex-1 mx-1 flex flex-col justify-end h-full gap-1">
                                    {/* Pro Ghost Bar */}
                                    <div
                                        className="w-full bg-purple-500/20 rounded-t"
                                        style={{ height: `${(proData.trace_pro[i] / 300) * 100}%` }}
                                    />
                                    {/* User Bar Overlay */}
                                    <div
                                        className="w-full bg-cyan-500/50 rounded-t absolute bottom-0"
                                        style={{
                                            height: `${(val / 300) * 100}%`,
                                            left: `${(i / proData.trace_you.length) * 100}%`,
                                            width: `${100 / proData.trace_you.length}%`
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/5 text-6xl font-black rotate-[-10deg]">
                            VS PRO
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default AnalysisDashboard;
