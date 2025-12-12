import React from 'react';

const VRMenu = () => {
    const openWidget = (viewName, displayName) => {
        window.open(`/?view=${viewName}&scale=1.0&bg=transparent`, displayName, 'width=400,height=400,frame=false,transparent=true');
    };

    const modules = [
        { id: 'radar', name: 'Radar Overlay', desc: 'Blindspot detection', icon: '🎯' },
        { id: 'inputs', name: 'Input Telemetry', desc: 'Throttle, Brake, Steering', icon: '📊' },
        { id: 'relative', name: 'Relative Table', desc: 'Driver gaps & IR', icon: '⏱️' },
        // Future: Fuel?
    ];

    return (
        <div className="w-screen h-screen bg-neutral-950 text-white flex flex-col items-center p-12 overflow-y-auto">
            <div className="w-full max-w-3xl space-y-8">

                <header className="flex justify-between items-end border-b border-purple-500/30 pb-4">
                    <div>
                        <h1 className="text-3xl font-black italic">VR LAUNCHER</h1>
                        <p className="text-purple-400 font-mono text-sm">NEURALLAP MODULE SYSTEM</p>
                    </div>
                    <button onClick={() => window.location.search = ""} className="text-gray-500 hover:text-white uppercase text-xs font-bold tracking-widest">
                        Exit to Home
                    </button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {modules.map(mod => (
                        <button
                            key={mod.id}
                            onClick={() => openWidget(mod.id, mod.name)}
                            className="bg-neutral-900 border border-white/5 rounded-xl p-6 flex items-center gap-4 hover:bg-neutral-800 hover:border-purple-500/50 transition-all text-left group"
                        >
                            <span className="text-4xl filter grayscale group-hover:grayscale-0 transition-all">{mod.icon}</span>
                            <div>
                                <h3 className="font-bold text-lg text-white group-hover:text-purple-300">{mod.name}</h3>
                                <p className="text-gray-500 text-sm">{mod.desc}</p>
                            </div>
                            <div className="ml-auto opacity-0 group-hover:opacity-100 text-purple-500">
                                ↗
                            </div>
                        </button>
                    ))}
                </div>

                <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-200">
                    <strong className="block text-blue-400 mb-1">📢 Tips for VR Users (OVR Toolkit / SteamVR):</strong>
                    <ul className="list-disc list-inside space-y-1 opacity-80">
                        <li>Each button above opens a <strong>new transparent window</strong>.</li>
                        <li>In VR, grab that window and place it in your cockpit.</li>
                        <li>Use URL params <code>&scale=2.0</code> to resize widgets if they look small.</li>
                        <li>This launcher window can be minimized or closed once widgets are open.</li>
                    </ul>
                </div>

            </div>
        </div>
    );
};

export default VRMenu;
