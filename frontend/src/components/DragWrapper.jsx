import React, { useRef } from 'react'
import Draggable from 'react-draggable'

export const DragWrapper = ({ children, id, editMode, layout, onLayoutChange, className = "" }) => {
    const nodeRef = useRef(null)
    const position = layout[id] || { x: 0, y: 0 }

    const handleStop = (e, data) => {
        onLayoutChange(id, { x: data.x, y: data.y })
    }

    if (!editMode) {
        // Render in place (or at saved absolute offset if we used absolute positioning)
        // For simplicity, we can continue to use Draggable but disabled, to maintain position
        return (
            <Draggable
                nodeRef={nodeRef}
                position={position}
                disabled={true}
            >
                <div ref={nodeRef} className={className}>
                    {children}
                </div>
            </Draggable>
        )
    }

    return (
        <Draggable
            nodeRef={nodeRef}
            position={position}
            onStop={handleStop}
        >
            <div ref={nodeRef} className={`${className} cursor-move border-2 border-dashed border-cyan-500 bg-black/20 relative group z-[100]`}>
                <div className="absolute -top-6 left-0 bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-t opacity-0 group-hover:opacity-100 transition-opacity">
                    {id}
                </div>
                {children}
            </div>
        </Draggable>
    )
}
