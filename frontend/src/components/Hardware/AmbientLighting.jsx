import { useEffect, useState } from 'react'

export default function AmbientLighting({ lightEvent }) {
    const [color, setColor] = useState('#000000')
    const [active, setActive] = useState(false)

    useEffect(() => {
        if (lightEvent && lightEvent.color !== '#000000') {
            setColor(lightEvent.color)
            setActive(true)
        } else {
            setActive(false)
        }
    }, [lightEvent])

    if (!active) return null

    return (
        <div
            className="fixed inset-0 pointer-events-none z-[100] transition-colors duration-300 ease-in-out mixing-blend-screen"
            style={{
                boxShadow: `inset 0 0 150px 50px ${color}`
            }}
        >
            {/* Optional: Add a top bar for Hue Strip simulation */}
            <div
                className="absolute top-0 left-0 right-0 h-2 blur-xl transition-colors duration-200"
                style={{ backgroundColor: color }}
            />
        </div>
    )
}
