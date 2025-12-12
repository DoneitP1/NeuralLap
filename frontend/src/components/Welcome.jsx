import React from 'react';

const Welcome = () => {
    const handleSelect = (mode) => {
        window.location.search = `?mode=${mode}`;
    };

    return (
        <div className="w-screen h-screen bg-black flex flex-col items-center justify-center p-8 gap-8 animate-fade-in relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black pointer-events-none"></div>
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

            <h1 className="text-6xl font-black text-white italic tracking-tighter z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                NEURAL<span className="text-cyan-500">LAP</span>
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-widest z-10 mb-8 max-w-md text-center">
                ADVANCED AI TELEMETRY & RACING ENGINEER
            </p>

            <div className="grid grid-cols-2 gap-8 w-full max-w-4xl z-10">
                {/* Desktop Option */}
                <button
                    onClick={() => handleSelect('desktop')}
                    className="group relative h-64 bg-neutral-900/80 border border-white/5 rounded-2xl p-6 hover:border-cyan-500 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-4 hover:shadow-[0_0_50px_rgba(6,182,212,0.2)]"
                >
                    <div className="p-4 rounded-full bg-cyan-900/30 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Desktop Dashboard</h2>
                        <p className="text-gray-500 text-sm">Full Screen HUD with all overlays.</p>
                    </div>
                </button>

                {/* VR Option */}
                <button
                    onClick={() => handleSelect('vr')}
                    className="group relative h-64 bg-neutral-900/80 border border-white/5 rounded-2xl p-6 hover:border-purple-500 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-4 hover:shadow-[0_0_50px_rgba(168,85,247,0.2)]"
                >
                    <div className="p-4 rounded-full bg-purple-900/30 text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-colors">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">VR Toolkit & Modules</h2>
                        <p className="text-gray-500 text-sm">Launch standalone widgets for OVR Toolkit/SteamVR.</p>
                    </div>
                </button>

                {/* Analysis Option */}
                <button
                    onClick={() => handleSelect('analysis')}
                    className="group relative h-64 bg-neutral-900/80 border border-white/5 rounded-2xl p-6 hover:border-yellow-500 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-4 hover:shadow-[0_0_50px_rgba(234,179,8,0.2)] col-span-2 md:col-span-1 md:col-start-1 md:col-end-3"
                >
                    <div className="p-4 rounded-full bg-yellow-900/30 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-1">Driver Analysis <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded ml-2">V2.0</span></h2>
                        <p className="text-gray-500 text-sm">DNA, Weakness Detection, Pro Comparison.</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Welcome;
