import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'

export default function ConnectModal({ onClose }) {
    const [ip, setIp] = useState('localhost')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch Local IP
        fetch('http://localhost:8000/api/network/ip')
            .then(res => res.json())
            .then(data => {
                setIp(data.ip)
                setLoading(false)
            })
            .catch(err => {
                console.error("Failed to fetch IP", err)
                setLoading(false)
            })
    }, [])

    const connectionUrl = `http://${ip}:5173/?host=${ip}&mode=mobile`

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in" onClick={onClose}>
            <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-white mb-2">Connect Mobile Device</h2>
                <p className="text-neutral-400 text-sm mb-8">Scan this QR code with your phone or tablet to launch the companion dashboard.</p>

                <div className="bg-white p-4 rounded-xl inline-block mb-8">
                    {loading ? (
                        <div className="w-48 h-48 flex items-center justify-center text-black">Loading IP...</div>
                    ) : (
                        <QRCodeSVG value={connectionUrl} size={192} />
                    )}
                </div>

                <div className="bg-neutral-800 rounded p-3 mb-6">
                    <p className="text-xs text-neutral-500 uppercase mb-1">Manual Link</p>
                    <code className="text-cyan-400 font-mono text-sm break-all">{connectionUrl}</code>
                </div>

                <div className="text-xs text-yellow-500 mb-6 bg-yellow-900/20 p-2 rounded">
                    ⚠️ Ensure your device is on the same Wi-Fi network: <strong>{ip}</strong>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-bold text-white transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    )
}
