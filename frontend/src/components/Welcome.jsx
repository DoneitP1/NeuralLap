import React, { useState } from 'react';
import ConnectModal from './ConnectModal'; // NEW

const Welcome = () => {
    const [showConnect, setShowConnect] = useState(false);

    const handleSelect = (mode) => {
        window.location.search = `?mode=${mode}`;
    };

    return (
        <div className="w-screen h-screen bg-black flex flex-col items-center justify-center p-8 gap-8 animate-fade-in relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-black pointer-events-none"></div>
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

            {/* Mobile Connect Button - Absolute Top Right */}
            <button
                onClick={() => setShowConnect(true)}
                className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-neutral-700 rounded-full text-neutral-400 hover:text-white hover:border-cyan-500 transition-colors z-50 shadow-lg"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                <span className="text-sm font-bold">Connect Mobile</span>
            </button>

            {showConnect && <ConnectModal onClose={() => setShowConnect(false)} />}

            <h1 className="text-6xl font-black text-white italic tracking-tighter z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                NEURAL<span className="text-cyan-500">LAP</span>
            </h1>
            <p className="text-gray-400 font-mono text-sm tracking-widest z-10 mb-8 max-w-md text-center">
                ADVANCED AI TELEMETRY & RACING ENGINEER
            </p>

            <div className="grid grid-cols-2 gap-6 w-full max-w-5xl z-10">
                {/* Desktop Option */}
                <button
                    onClick={() => handleSelect('desktop&bg=black')}
                    className="group relative h-48 bg-neutral-900/80 border border-white/5 rounded-2xl p-6 hover:border-cyan-500 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)]"
                >
                    <div className="p-3 rounded-full bg-cyan-900/30 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-0.5">Desktop HUD</h2>
                        <p className="text-gray-500 text-xs">Full Screen Overlay</p>
                    </div>
                </button>

                {/* VR Option */}
                <button
                    onClick={() => handleSelect('vr')}
                    className="group relative h-48 bg-neutral-900/80 border border-white/5 rounded-2xl p-6 hover:border-purple-500 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)]"
                >
                    <div className="p-3 rounded-full bg-purple-900/30 text-purple-400 group-hover:bg-purple-500 group-hover:text-black transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-0.5">VR Toolkit</h2>
                        <p className="text-gray-500 text-xs">Standalone Widgets</p>
                    </div>
                </button>

                {/* Analysis Option */}
                <button
                    onClick={() => handleSelect('analysis')}
                    className="group relative h-48 bg-neutral-900/80 border border-white/5 rounded-2xl p-6 hover:border-yellow-500 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(234,179,8,0.15)]"
                >
                    <div className="p-3 rounded-full bg-yellow-900/30 text-yellow-400 group-hover:bg-yellow-500 group-hover:text-black transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-0.5">Analysis V2</h2>
                        <p className="text-gray-500 text-xs">Deep Telemetry & DNA</p>
                    </div>
                </button>

                {/* Marketplace Option - NEW */}
                <button
                    onClick={() => handleSelect('marketplace')}
                    className="group relative h-48 bg-neutral-900/80 border border-white/5 rounded-2xl p-6 hover:border-blue-500 transition-all duration-300 hover:scale-[1.02] flex flex-col items-center justify-center gap-3 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)]"
                >
                    <div className="p-3 rounded-full bg-blue-900/30 text-blue-400 group-hover:bg-blue-500 group-hover:text-black transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-0.5">Marketplace</h2>
                        <p className="text-gray-500 text-xs">Setups & Sharing</p>
                    </div>
                </button>

                {/* Leagues Option - NEW */}
                <button
                    onClick={() => handleSelect('leagues')}
                    className="col-span-2 group relative h-32 bg-neutral-900/80 border border-white/5 rounded-2xl p-6 hover:border-green-500 transition-all duration-300 hover:scale-[1.01] flex flex-row items-center justify-center gap-6 hover:shadow-[0_0_30px_rgba(34,197,94,0.15)]"
                >
                    <div className="p-3 rounded-full bg-green-900/30 text-green-400 group-hover:bg-green-500 group-hover:text-black transition-colors">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <div className="text-left">
                        <h2 className="text-2xl font-bold text-white mb-0.5">Virtual Leagues</h2>
                        <p className="text-gray-500 text-sm">Proving Grounds: Cleanest & Most Consistent Drivers</p>
                    </div>
                </button>
            </div>
        </div>
    );
};

export default Welcome;
