import { useState } from 'react'
import './GraphNode.css'

export default function GraphNode({ nodeWidth, nodeHeight, y, nodeName, handleMove }) {
    const [dragging, setDragging] = useState(true)
    const [coordinates, setCoordinates] = useState(0);
    const [origin, setOrigin] = useState(0);
    return (
        <g
            className="unselectable"
            onMouseDown={e => {
                setOrigin(e.clientY);
                setDragging(true);
            }}
            onMouseMove={e => {
                if (dragging) {
                    setCoordinates(e.clientY - origin);
                    console.log(e.clientY - origin);
                }
            }}
            onMouseUp={() => {
                setDragging(false);
                handleMove(coordinates)
            }}

            style={{cursor: 'pointer'}}
        >
            <rect
                width={nodeWidth}
                height={nodeHeight}
                y={y}
                fill="lightblue"
                stroke="black"
                strokeWidth="1"
            />
            <text
                x={40}
                y={y + 20}
                textAnchor="middle"
                fontSize="12"
                fill="black"
            >
                {nodeName}
            </text>
        </g>
    )
}