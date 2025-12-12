import { useState, useEffect } from 'react'

export default function Marketplace() {
    const [setups, setSetups] = useState([])
    const [loading, setLoading] = useState(true)

    // Mock Fetch
    useEffect(() => {
        // In real impl: fetch('http://localhost:8000/api/community/setups')
        setTimeout(() => {
            setSetups([
                { id: 1, name: "Silverstone Quali V1", car: "Mercedes W13", track: "Silverstone", author: "LewisH", price: 0, downloads: 124 },
                { id: 2, name: "Spa Wet Setup", car: "Red Bull RB18", track: "Spa", author: "MaxV", price: 50, downloads: 89 },
                { id: 3, name: "Monza Low Downforce", car: "Ferrari F1-75", track: "Monza", author: "CharlesL", price: 0, downloads: 256 },
            ])
            setLoading(false)
        }, 1000)
    }, [])

    return (
        <div className="p-8 text-white h-full overflow-y-auto">
            <h1 className="text-3xl font-bold mb-6">Setup Marketplace</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {setups.map(setup => (
                    <div key={setup.id} className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 hover:border-blue-500 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-white">{setup.name}</h3>
                                <p className="text-sm text-neutral-400">{setup.car} @ {setup.track}</p>
                            </div>
                            <span className="px-2 py-1 bg-neutral-700 rounded text-xs text-neutral-300">
                                {setup.downloads} DL
                            </span>
                        </div>

                        <div className="flex justify-between items-center mt-4">
                            <span className="text-sm text-neutral-500">By {setup.author}</span>
                            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-semibold text-sm transition-colors">
                                {setup.price === 0 ? "Download Free" : `Buy ${setup.price} CR`}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
