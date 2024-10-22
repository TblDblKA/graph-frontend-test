import './GraphNode.css'

interface Props {
    nodeWidth: number
    nodeHeight: number
    y: number
    nodeName: string
}

export const GraphNode = ({ nodeWidth, nodeHeight, y, nodeName }: Props) => {
    return (
        <g
            className="unselectable"
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