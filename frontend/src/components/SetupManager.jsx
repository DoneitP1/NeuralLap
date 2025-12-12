import React, { useState, useEffect } from 'react';

const SetupManager = ({ suggestion }) => {
    const [visible, setVisible] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (suggestion && suggestion.active) {
            setVisible(true);
            setLoaded(false); // Reset load state on new suggestion
        } else {
            // If suggestion goes away (e.g. backend clears it), hide
            // setVisible(false); 
            // Or keep it until user dismisses? Let's hide if data stops.
            if (!suggestion) setVisible(false);
        }
    }, [suggestion]);

    if (!visible || !suggestion) return null;

    const handleLoad = () => {
        // Simulate loading action
        setLoaded(true);
        // In real app, emit('load_setup', ...)
        setTimeout(() => {
            setVisible(false); // Hide after success
        }, 3000);
    };

    return (
        <div className="absolute top-20 right-10 w-80 bg-neutral-900 border border-teal-500/50 rounded-xl shadow-[0_0_30px_rgba(20,184,166,0.2)] overflow-hidden animate-slide-in">
            {/* Header */}
            <div className="bg-teal-900/40 p-3 flex justify-between items-center border-b border-teal-500/20">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-bold text-teal-100 uppercase tracking-wider">Auto-Setup</span>
                </div>
                <button onClick={() => setVisible(false)} className="text-teal-400 hover:text-white">✕</button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {loaded ? (
                    <div className="flex flex-col items-center py-4 text-green-400 animate-fade-in">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span className="font-bold">Setup Loaded Successfully!</span>
                    </div>
                ) : (
                    <>
                        <div className="space-y-1">
                            <div className="text-xs text-gray-400 uppercase font-bold">New Best Setup Found</div>
                            <div className="text-lg font-bold text-white leading-tight">{suggestion.best_setup_name}</div>
                            <div className="text-xs text-teal-400">{suggestion.source}</div>
                        </div>

                        <div className="bg-black/50 p-2 rounded border border-white/5 space-y-1">
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Track</span>
                                <span className="text-gray-300">{suggestion.track}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Car</span>
                                <span className="text-gray-300">{suggestion.car}</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-gray-500">Conditions</span>
                                <span className="text-gray-300">{suggestion.conditions}</span>
                            </div>
                        </div>

                        {suggestion.tire_bot && (
                            <div className="bg-blue-900/30 p-2 rounded border border-blue-500/30">
                                <span className="block text-[10px] font-bold text-blue-300 uppercase mb-1">🤖 Tire Pressure Bot</span>
                                <p className="text-xs text-blue-100">{suggestion.tire_bot.suggestion}</p>
                                <p className="text-[10px] text-blue-400 mt-1 italic">{suggestion.tire_bot.reason}</p>
                            </div>
                        )}

                        <button
                            onClick={handleLoad}
                            className="w-full py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded transition-colors shadow-lg shadow-teal-900/50"
                        >
                            Load Setup & Adjust Tires
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default SetupManager;
