import * as constants from '../consts'
import { Node } from '../interfaces'
import { GraphNode } from './GraphNode'

export const NodesColumns = ({ columns, colIndex, nodes }: { columns: number[], colIndex: number, nodes: Node[] }) => {
    function nodeName(nodeId: number): string {
        return nodes?.length ? (nodes.find(el => el.id === nodeId)?.name || '') : ''
    }
    return (
        <>
            <svg
                x={colIndex * (constants.COLUMN_SPACING + constants.NODE_WIDTH)}
            >
                {columns.map((nodeId, rowIndex) =>
                    <GraphNode
                        key={nodeId}
                        y={rowIndex * (constants.ROW_SPACING + constants.NODE_HEIGHT)}
                        nodeWidth={constants.NODE_WIDTH}
                        nodeHeight={constants.NODE_HEIGHT}
                        nodeName={nodeName(nodeId)}
                    />
                )}
            </svg>
        </>
    )
}