import { useState, useEffect } from 'react'

export default function Leagues() {
    const [entries, setEntries] = useState([])
    const [loading, setLoading] = useState(true)

    // Mock Fetch
    useEffect(() => {
        // In real impl: fetch('http://localhost:8000/api/community/leagues/1/entries')
        setTimeout(() => {
            setEntries([
                { id: 1, driver: "Max Ver", time: "1:34.102", clean: 95, consistent: 98 },
                { id: 2, driver: "Lando No", time: "1:34.250", clean: 99, consistent: 92 },
                { id: 3, driver: "You", time: "1:34.310", clean: 88, consistent: 85 },
                { id: 4, driver: "Geo Rus", time: "1:34.400", clean: 60, consistent: 90 },
            ])
            setLoading(false)
        }, 800)
    }, [])

    return (
        <div className="p-8 text-white h-full overflow-y-auto">
            <h1 className="text-3xl font-bold mb-2">Virtual Leagues</h1>
            <p className="text-neutral-400 mb-8">Global Daily League - Ranked by Cleanliness & Speed</p>

            <div className="bg-neutral-800 rounded-xl overflow-hidden border border-neutral-700">
                <table className="w-full text-left">
                    <thead className="bg-neutral-700 text-neutral-300 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">Rank</th>
                            <th className="px-6 py-3">Driver</th>
                            <th className="px-6 py-3 text-right">Lap Time</th>
                            <th className="px-6 py-3 text-center">Cleanliness</th>
                            <th className="px-6 py-3 text-center">Consistency</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-700">
                        {entries.map((entry, idx) => (
                            <tr key={entry.id} className="hover:bg-neutral-750 transition-colors">
                                <td className="px-6 py-4 font-mono text-neutral-400">#{idx + 1}</td>
                                <td className="px-6 py-4 font-bold">{entry.driver}</td>
                                <td className="px-6 py-4 text-right font-mono text-yellow-400">{entry.time}</td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${entry.clean >= 90 ? 'bg-green-900 text-green-300' :
                                            entry.clean >= 70 ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                                        }`}>
                                        {entry.clean}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center text-neutral-300">{entry.consistent}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
