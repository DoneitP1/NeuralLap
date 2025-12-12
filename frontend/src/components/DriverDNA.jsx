import React, { useEffect, useState } from 'react';

const DriverDNA = () => {
    const [dna, setDna] = useState(null);

    useEffect(() => {
        fetch('http://localhost:8000/api/analysis/dna')
            .then(res => res.json())
            .then(data => setDna(data))
            .catch(err => console.error("Failed to fetch DNA", err));
    }, []);

    if (!dna) return <div className="text-white animate-pulse">Analyzing Driving Style...</div>;

    // Custom Polygon Logic for Radar Chart
    const stats = [
        { label: 'AGGRESSION', value: dna.aggression },
        { label: 'CONSISTENCY', value: dna.consistency },
        { label: 'SMOOTHNESS', value: dna.smoothness },
        { label: 'BRAKING', value: dna.braking_confidence },
        { label: 'CORNERING', value: dna.cornering_speed },
    ];

    const radius = 80;
    const center = 100;

    const getPoint = (index, value) => {
        const angle = (Math.PI * 2 * index) / stats.length - Math.PI / 2;
        const dist = (value / 100) * radius;
        const x = center + Math.cos(angle) * dist;
        const y = center + Math.sin(angle) * dist;
        return `${x},${y}`;
    };

    const polyPoints = stats.map((stat, i) => getPoint(i, stat.value)).join(" ");
    const bgPoints = stats.map((stat, i) => getPoint(i, 100)).join(" ");

    return (
        <div className="bg-neutral-900/80 backdrop-blur-md rounded-2xl p-6 border border-white/5 flex flex-col items-center w-full max-w-sm">
            <h3 className="text-xl font-bold text-white mb-1">DRIVER DNA</h3>
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase mb-4">{dna.archetype}</span>

            <div className="relative w-48 h-48">
                <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                    {/* Background Hexagon */}
                    <polygon points={bgPoints} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                    <circle cx="100" cy="100" r="1" fill="white" />

                    {/* Stat Shapes */}
                    <polygon points={polyPoints} fill="rgba(6,182,212,0.2)" stroke="#06b6d4" strokeWidth="2" className="transition-all duration-1000 ease-out" />
                </svg>

                {/* Labels */}
                {stats.map((stat, i) => {
                    const angle = (Math.PI * 2 * i) / stats.length - Math.PI / 2;
                    const x = 100 + Math.cos(angle) * (radius + 20);
                    const y = 100 + Math.sin(angle) * (radius + 15);
                    return (
                        <div key={i} className="absolute text-[8px] font-bold text-gray-400 -translate-x-1/2 -translate-y-1/2" style={{ left: `${(x / 200) * 100}%`, top: `${(y / 200) * 100}%` }}>
                            {stat.label}
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full mt-6">
                {stats.map((s, i) => (
                    <div key={i} className="flex flex-col">
                        <span className="text-[9px] text-gray-500 font-bold">{s.label}</span>
                        <div className="w-full h-1 bg-gray-800 rounded-full mt-1 overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${s.value}%` }}></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DriverDNA;
