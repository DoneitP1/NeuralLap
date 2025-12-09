import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function Spotter({ left, right }) {
    if (!left && !right) return null;

    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] pointer-events-none flex justify-between items-center opacity-90">

            {/* Left Indicator */}
            <div className={cn(
                "transition-all duration-150 transform",
                left ? "opacity-100 translate-x-0" : "opacity-0 translate-x-10"
            )}>
                {/* Main Bar */}
                <div className="w-4 h-64 bg-red-600 rounded-r-lg shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse" />
                {/* Arrows */}
                <div className="absolute top-1/2 -left-16 -translate-y-1/2 flex flex-col gap-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500 stroke-[4]">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                </div>
            </div>

            {/* Right Indicator */}
            <div className={cn(
                "transition-all duration-150 transform",
                right ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-10"
            )}>
                <div className="w-4 h-64 bg-red-600 rounded-l-lg shadow-[0_0_20px_rgba(220,38,38,0.8)] animate-pulse ml-auto" />
                <div className="absolute top-1/2 -right-16 -translate-y-1/2 flex flex-col gap-2">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-red-500 stroke-[4]">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            </div>

        </div>
    );
}
