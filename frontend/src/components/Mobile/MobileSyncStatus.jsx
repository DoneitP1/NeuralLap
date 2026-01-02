import React from 'react';

const MobileSyncStatus = ({ data }) => {
    // Check if we have received a mobile sync recenlty (mock logic)
    // Real logic would check timestamp delta
    const lastSyncTime = data?.timestamp ? new Date(data.timestamp * 1000).toLocaleTimeString() : 'Never';

    return (
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full border border-white/5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Mobile Sync: {lastSyncTime}</span>
        </div>
    );
};

export default MobileSyncStatus;
