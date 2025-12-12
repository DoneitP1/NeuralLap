import React, { useState, useEffect, useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export const RelativeTable = React.memo(({ drivers }) => {
    // Default position (Left side)
    const [pos, setPos] = useState({ x: 32, y: 300 });
    const [dragging, setDragging] = useState(false);
    const [rel, setRel] = useState(null); // Relative offset from cursor

    const onMouseDown = (e) => {
        if (e.button !== 0) return;
        setDragging(true);
        setRel({
            x: e.clientX - pos.x,
            y: e.clientY - pos.y
        });
        e.stopPropagation();
        e.preventDefault();
    };

    const onMouseMove = (e) => {
        if (!dragging) return;

        // Calculate new position
        let newX = e.clientX - rel.x;
        let newY = e.clientY - rel.y;

        // Clamp to window bounds (assuming 256px width approx for table)
        const maxX = window.innerWidth - 200;
        const maxY = window.innerHeight - 100;

        setPos({
            x: Math.max(0, Math.min(newX, maxX)),
            y: Math.max(0, Math.min(newY, maxY))
        });
        e.stopPropagation();
        e.preventDefault();
    };

    const onMouseUp = () => {
        setDragging(false);
    };

    // Global listeners for smooth drag even outside the div
    useEffect(() => {
        if (dragging) {
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        } else {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, [dragging]);

    if (!drivers || drivers.length === 0) return null;

    return (
        <div
            className={cn(
                "absolute bg-black/80 backdrop-blur-md rounded-xl border border-white/10 p-4 shadow-2xl w-64 cursor-move active:cursor-grabbing select-none transition-shadow",
                dragging ? "shadow-cyan-500/20 border-cyan-500/50" : ""
            )}
            style={{
                left: pos.x,
                top: pos.y,
                zIndex: 100
            }}
            onMouseDown={onMouseDown}
        >
            {/* Grip Handle Hint */}
            <div className="absolute top-2 right-2 flex gap-0.5 opacity-20 pointer-events-none">
                <div className="w-1 h-3 bg-white rounded-full"></div>
                <div className="w-1 h-3 bg-white rounded-full"></div>
            </div>

            <div className="text-[10px] font-bold text-gray-400 mb-2 tracking-widest uppercase border-b border-white/10 pb-1 flex justify-between">
                <span>POS</span>
                <span>DRIVER</span>
                <span>GAP</span>
            </div>

            <div className="flex flex-col gap-1.5 pointer-events-none">
                {drivers.map((driver, idx) => {
                    // Just basic logic for gap color: red if close < 1s
                    const isClose = Math.abs(driver.gap) < 1.0;
                    const gapColor = isClose ? "text-red-500 font-bold animate-pulse" : "text-green-400";

                    // Name color based on class/flag
                    let nameColor = "text-white";
                    if (driver.class_color === 'blue') nameColor = "text-blue-400"; // Lapped
                    if (driver.class_color === 'red') nameColor = "text-red-500 font-bold"; // Rival

                    return (
                        <div key={idx} className="flex items-center justify-between text-sm group">
                            <div className="w-8 text-xs font-mono text-gray-500">{driver.pos}</div>

                            <div className="flex-1 flex flex-col">
                                <div className={cn("font-bold tracking-tight", nameColor)}>
                                    #{driver.car_idx} {driver.name}
                                </div>
                                {/* iRating / SR Badge */}
                                <div className="flex gap-2 text-[9px] opacity-60 group-hover:opacity-100 transition-opacity">
                                    <span className="text-yellow-500">iR {driver.ir}</span>
                                    <span className="text-cyan-400">{driver.sr}</span>
                                </div>
                            </div>

                            <div className={cn("font-mono font-medium w-12 text-right", gapColor)}>
                                {driver.gap > 0 ? '+' : ''}{driver.gap.toFixed(1)}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* User Row (Center Mock) */}
            <div className="my-2 bg-white/10 p-2 -mx-2 rounded relative border-l-4 border-yellow-500">
                <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-yellow-500">P8</span>
                    <span className="text-sm font-black text-white">YOU</span>
                    <span className="text-xs font-mono text-gray-400">---</span>
                </div>
            </div>
        </div>
    );
});
