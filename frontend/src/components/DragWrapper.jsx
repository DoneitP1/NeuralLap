import { Rnd } from 'react-rnd';

export const DragWrapper = ({ children, id, editMode, layout, onLayoutChange, className = "", defaultSize }) => {
    // Layout now stores {x, y, width, height}
    const itemLayout = layout[id] || { x: 0, y: 0, width: 'auto', height: 'auto' };

    // Check if we have valid numeric positions, otherwise default (e.g. for first render if not in layout yet)
    // Actually, Rnd manages its internal state better if we use 'default' vs 'position/size' props.
    // But to persist, we need controlled component.

    const handleStop = (e, d) => {
        onLayoutChange(id, {
            ...itemLayout,
            x: d.x,
            y: d.y
        });
    }

    const handleResizeStop = (e, direction, ref, delta, position) => {
        onLayoutChange(id, {
            width: ref.style.width,
            height: ref.style.height,
            ...position
        });
    }

    if (!editMode) {
        return (
            <div
                className={className}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transform: `translate(${itemLayout.x}px, ${itemLayout.y}px)`,
                    width: itemLayout.width,
                    height: itemLayout.height,
                    zIndex: 20, // Ensure visibility
                }}
            >
                {children}
            </div>
        )
    }

    return (
        <Rnd
            size={{ width: itemLayout.width || 'auto', height: itemLayout.height || 'auto' }}
            position={{ x: itemLayout.x, y: itemLayout.y }}
            onDragStop={handleStop}
            onResizeStop={handleResizeStop}
            className={`${className} border-2 border-dashed border-cyan-500 bg-black/20 z-[100] group`}
            bounds="window"
            enableResizing={true}
        >
            <div className="absolute -top-6 left-0 bg-cyan-500 text-black text-xs font-bold px-2 py-0.5 rounded-t opacity-50 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                {id} (Drag & Resize)
            </div>
            {children}
        </Rnd>
    )
}
