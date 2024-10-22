import * as constants from '../consts'
import type { Columns, Edge } from '../interfaces'

export const Edges = ({ columns, graphEdges }: { columns: Columns, graphEdges: Edge[] }) => {
    function getLinePosition(fromId: number, toId: number): {x: number; y: number}[] {
        if (columns.length === 0) return [{ x: 0, y: 0 }, { x: 0, y: 0 }]
        for (let colIndex = 0; colIndex < columns.length - 1; colIndex++) {
            const fromRowIndex = columns[colIndex].indexOf(fromId)
            if (fromRowIndex !== -1) {
                const toRowIndex = columns[colIndex + 1].indexOf(toId)
                if (toRowIndex !== -1) {
                    return [
                        {
                            x: (colIndex + 1) * (constants.NODE_WIDTH) + colIndex * constants.COLUMN_SPACING,
                            y: fromRowIndex * (constants.NODE_HEIGHT + constants.ROW_SPACING) + constants.NODE_HEIGHT / 2,
                        },
                        {
                            x: (colIndex + 1) * (constants.NODE_WIDTH) + (colIndex + 1) * constants.COLUMN_SPACING,
                            y: toRowIndex * (constants.NODE_HEIGHT + constants.ROW_SPACING) + constants.NODE_HEIGHT / 2,
                        }
                    ]
                }
            }
        }
        return [{ x: 0, y: 0 }, { x: 0, y: 0 }]
    }
    return (
        <>
            {
                graphEdges.map((edge: Edge, i: number) => {
                    const [fromPos, toPos] = getLinePosition(edge.fromId, edge.toId)
                    return (
                        <line
                            key={i}
                            x1={fromPos.x}
                            y1={fromPos.y}
                            x2={toPos.x}
                            y2={toPos.y}
                            stroke="black"
                            strokeWidth="2"
                        />
                    )
                })
            }
        </>
    )
}