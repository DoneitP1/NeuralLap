import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import RadarOverlay from '../RadarOverlay'

export default function MobileCompanion({ data }) {
    const [activeTab, setActiveTab] = useState('dash') // dash, tires, map

    return (
        <div className="w-full h-screen bg-black text-white flex flex-col overflow-hidden">
            {/* Top Bar */}
            <div className="h-14 bg-neutral-900 flex items-center justify-between px-4 border-b border-neutral-800">
                <div className="font-bold text-lg italic">NEURAL<span className="text-cyan-500">LAP</span></div>
                <div className="text-sm font-mono text-neutral-400">MOBILE LINK</div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative">
                <AnimatePresence mode="wait">
                    {activeTab === 'dash' && (
                        <motion.div
                            key="dash"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute inset-0 p-4 flex flex-col justify-center items-center gap-6"
                        >
                            {/* Gear & Speed */}
                            <div className="flex flex-col items-center">
                                <div className="text-[8rem] font-black leading-none text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                                    {data.gear === 0 ? 'N' : data.gear === -1 ? 'R' : data.gear}
                                </div>
                                <div className="text-4xl font-mono text-white mt-[-10px]">{Math.round(data.speed)} <span className="text-lg text-neutral-500">KPH</span></div>
                            </div>

                            {/* RPM Bar */}
                            <div className="w-full h-8 bg-neutral-800 rounded-full overflow-hidden border border-neutral-700">
                                <div
                                    className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-75"
                                    style={{ width: `${(data.rpm / 12000) * 100}%` }}
                                ></div>
                            </div>

                            {/* Delta */}
                            <div className="flex gap-4 w-full">
                                <div className="flex-1 bg-neutral-800 rounded-lg p-4 text-center border border-neutral-700">
                                    <div className="text-xs text-neutral-500 uppercase">Delta</div>
                                    <div className={`text-2xl font-bold font-mono ${data.potential_lap < data.predicted_lap ? 'text-green-500' : 'text-red-500'}`}>
                                        {(data.predicted_lap - data.potential_lap).toFixed(3)}
                                    </div>
                                </div>
                                <div className="flex-1 bg-neutral-800 rounded-lg p-4 text-center border border-neutral-700">
                                    <div className="text-xs text-neutral-500 uppercase">Lap Time</div>
                                    <div className="text-2xl font-bold font-mono text-white">
                                        1:34.2
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tires' && (
                        <motion.div
                            key="tires"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute inset-0 p-4 flex flex-col justify-center gap-6"
                        >
                            <h2 className="text-xl font-bold text-neutral-300 text-center">Tire Management</h2>
                            <div className="grid grid-cols-2 gap-8 max-w-sm mx-auto w-full">
                                {['FL', 'FR', 'RL', 'RR'].map(tire => (
                                    <div key={tire} className="aspect-square bg-neutral-800 rounded-xl border border-neutral-700 flex flex-col items-center justify-center gap-1">
                                        <span className="text-neutral-500 font-bold">{tire}</span>
                                        <span className="text-3xl font-bold text-yellow-400">98°</span>
                                        <span className="text-sm text-neutral-400">23.1 PSI</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'map' && (
                        <motion.div
                            key="map"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute inset-0 flex items-center justify-center bg-neutral-900"
                        >
                            <div className="transform scale-150">
                                <RadarOverlay cars={data.radar_cars} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="h-20 bg-neutral-900 border-t border-neutral-800 flex justify-around items-center px-2 pb-safe">
                <button
                    onClick={() => setActiveTab('dash')}
                    className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'dash' ? 'text-cyan-500' : 'text-neutral-500'}`}
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    <span className="text-xs font-bold">Dash</span>
                </button>
                <button
                    onClick={() => setActiveTab('tires')}
                    className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'tires' ? 'text-cyan-500' : 'text-neutral-500'}`}
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="text-xs font-bold">Tires</span>
                </button>
                <button
                    onClick={() => setActiveTab('map')}
                    className={`flex flex-col items-center justify-center w-full h-full ${activeTab === 'map' ? 'text-cyan-500' : 'text-neutral-500'}`}
                >
                    <svg className="w-6 h-6 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
                    <span className="text-xs font-bold">Map</span>
                </button>
            </div>
        </div>
    )
}
