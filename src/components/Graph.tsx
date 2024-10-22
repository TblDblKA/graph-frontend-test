import {useEffect, useState} from "react"
import { NodesColumns } from './NodesColumns'
import { Edges } from './Edges'
import type { GraphStr } from '../interfaces'
import * as constants from '../consts'

type Columns = number[][]
type AdjacencyList = Record<number, number[]>

export const Graph = ({ graphData }: { graphData: GraphStr }) => {
    const [columns, setColumns] = useState<Columns>([]);
    const maxHeight = columns.reduce((maxLength, column) => Math.max(maxLength, column.length), 0)

    useEffect(() => {
        if (!graphData.edges?.length) return
        const processedColumns = buildColumns()
        setColumns(processedColumns)
    }, [graphData])

    function buildColumns(): Columns {
        if (!graphData.edges?.length) return []
        const adjacencyList: AdjacencyList = {}
        const hasParent: Record<number, boolean> = {}

        graphData.nodes.forEach(node => {
            hasParent[node.id] = false
            adjacencyList[node.id] = []
        })

        graphData.edges.forEach(edge => {
            adjacencyList[edge.fromId].push(edge.toId)
            hasParent[edge.toId] = true
        })
        const columns: Columns = []
        const visited = new Set()
        let currentColumn = graphData.nodes
            .filter(node => !hasParent[node.id])
            .map(node => node.id)
        while (currentColumn.length > 0) {
            columns.push(currentColumn)
            const nextColumn: number[] = []
            currentColumn.forEach(nodeId => {
                adjacencyList[nodeId].forEach(childId => {
                    if (!visited.has(childId)) {
                        nextColumn.push(childId)
                        visited.add(childId)
                    }

                })
            })
            currentColumn = nextColumn
        }
        return reorderColumns(columns, adjacencyList)
    }

    function reorderColumns(columns: Columns, adjList: AdjacencyList): Columns {
        let forgivenessNumber = 10
        let lowestCrossings = Infinity
        let totalCrossings = 0
        // make a deep copy
        let bestConfiguration = columns.map(el => [...el])
        let currentConfiguration = bestConfiguration.map(el => [...el])

        while (forgivenessNumber > 0 || lowestCrossings !== 0) {
            totalCrossings = 0
            for (let i = 1; i < currentConfiguration.length; i++) {
                const baseLayer = [...currentConfiguration[i - 1]]
                const currentLayer = [...currentConfiguration[i]]
                const fixedLayer = barycenterFix(baseLayer, currentLayer, adjList)
                currentConfiguration[i] = fixedLayer
                const crossings = countCrossing(baseLayer, fixedLayer)
                totalCrossings += crossings
            }
            if (totalCrossings >= lowestCrossings) {
                forgivenessNumber--
                currentConfiguration = bestConfiguration.map(el => [...el])
            } else {
                lowestCrossings = totalCrossings
                bestConfiguration = currentConfiguration.map(el => [...el])
            }

            if (forgivenessNumber === 0) break
            if (lowestCrossings === 0) break

            totalCrossings = 0
            for (let i = currentConfiguration.length - 2; i >= 0; i--) {
                const baseLayer = [...currentConfiguration[i + 1]]
                const currentLayer = [...currentConfiguration[i]]
                const fixedLayer = barycenterFixRight(baseLayer, currentLayer, adjList)
                currentConfiguration[i] = fixedLayer
                const crossings = countCrossing(baseLayer, fixedLayer, 'right')
                totalCrossings += crossings
            }
            if (totalCrossings >= lowestCrossings) {
                forgivenessNumber--
                currentConfiguration = bestConfiguration.map(el => [...el])
            } else {
                lowestCrossings = totalCrossings
                bestConfiguration = currentConfiguration.map(el => [...el])
            }
            if (lowestCrossings === 0) break
        }
        //
        return bestConfiguration
    }

    function barycenterFix(baseLayer: number[], currentLayer: number[], adjList: AdjacencyList): number[] {
        const barycenters = currentLayer.map(childNode => {
            const weight = baseLayer.reduce(([barycenter, num], parentNode, index) => {
                if (adjList[parentNode].includes(childNode)) return [(index + num * barycenter) / (num + 1), num + 1]
                return [barycenter, num]
            }, [0, 0])
            return {
                nodeId: childNode,
                barycenter: weight,
            }
        })
        barycenters.sort((el1, el2) => {
            if (el1.barycenter < el2.barycenter) return -1
            else if (el1.barycenter > el2.barycenter) return 1
            else return (Math.random() - 0.5)
        })
        return barycenters.map(el => el.nodeId)
    }

    function barycenterFixRight(baseLayer: number[], currentLayer: number[], adjList: AdjacencyList): number[] {
        const barycenters = currentLayer.map(parentNode => {
            const weight = adjList[parentNode].reduce((barycenter, childNode) => {
                return barycenter + baseLayer.indexOf(childNode) + 1
            }, 0) / adjList[parentNode].length
            return {
                nodeId: parentNode,
                barycenter: weight,
            }
        })
        barycenters.sort((el1, el2) => {
            if (el1.barycenter < el2.barycenter) return -1
            else if (el1.barycenter > el2.barycenter) return 1
            else return (Math.random() - 0.5)
        })
        return barycenters.map(el => el.nodeId)
    }

    function countCrossing(baseLayer: number[], currentLayer: number[], direction='left'): number {
        let crossings = 0
        const edges = graphData.edges.filter(edge => direction === 'left' ? baseLayer.includes(edge.fromId) : baseLayer.includes(edge.toId))
        for (let i = 0; i < edges.length; i++) {
            for (let j = i + 1; j < edges.length; j++) {
                const firstEdge = edges[i]
                const secondEdge = edges[j]
                if (direction === 'left') {
                    if (firstEdge.fromId === secondEdge.fromId) continue
                    const firstFromId = baseLayer.indexOf(firstEdge.fromId)
                    const firstToId = currentLayer.indexOf(firstEdge.toId)
                    const secondFromId = baseLayer.indexOf(secondEdge.fromId)
                    const secondToId = currentLayer.indexOf(secondEdge.toId)
                    if ((firstFromId - secondFromId) * (firstToId - secondToId) < 0) {
                        crossings++
                    }
                } else {
                    if (firstEdge.toId === secondEdge.toId) continue
                    const firstFromId = baseLayer.indexOf(firstEdge.toId)
                    const firstToId = currentLayer.indexOf(firstEdge.fromId)
                    const secondFromId = baseLayer.indexOf(secondEdge.toId)
                    const secondToId = currentLayer.indexOf(secondEdge.fromId)
                    if ((firstFromId - secondFromId) * (firstToId - secondToId) < 0) {
                        crossings++
                    }
                }
            }
        }
        return crossings
    }

    return (
        <div>
            {graphData.edges?.length && graphData.nodes?.length && columns.length &&
                (
                    <svg
                        width={constants.NODE_WIDTH * columns.length + constants.COLUMN_SPACING * (columns.length - 1) + 2}
                        height={constants.NODE_HEIGHT * maxHeight + constants.ROW_SPACING * (maxHeight - 1) + 2}
                    >
                        <Edges
                            columns={columns}
                            graphEdges={graphData.edges}
                        />
                        {columns.map((nodes, colIndex) =>
                            <NodesColumns
                                key={colIndex}
                                columns={nodes}
                                colIndex={colIndex}
                                nodes={graphData.nodes}
                            />
                        )}
                    </svg>
                )}
        </div>
    )
}