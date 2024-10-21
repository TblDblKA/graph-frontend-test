import {useEffect, useState} from "react"
import GraphNode from "./GraphNode"

export default function Graph({ graphData }) {
    const [columns, setColumns] = useState([]);
    const maxHeight = columns.reduce((maxLength, column) => Math.max(maxLength, column.length), 0);

    useEffect(() => {
        if (!graphData.edges?.length) return
        const processedColumns = buildColumns()
        setColumns(processedColumns)
    }, [graphData])

    function buildColumns() {
        if (!graphData.edges?.length) return
        const adjacencyList = {}
        const hasParent = {}

        graphData.nodes.forEach(node => {
            hasParent[node.id] = false
            adjacencyList[node.id] = []
        })

        graphData.edges.forEach(edge => {
            adjacencyList[edge.fromId].push(edge.toId)
            hasParent[edge.toId] = true
        })
        const columns = []
        const visited = new Set()
        let currentColumn = graphData.nodes
            .filter(node => !hasParent[node.id])
            .map(node => node.id)
        while (currentColumn.length > 0) {
            columns.push(currentColumn)
            const nextColumn = []
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

    function reorderColumns(columns,adjList) {
        // debugger
        let forgivenessNumber = 10
        let lowestCrossings = Infinity
        let totalCrossings = 0
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

    function barycenterFix(baseLayer, currentLayer, adjList) {
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

    function barycenterFixRight(baseLayer, currentLayer, adjList) {
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

    function countCrossing(baseLayer, currentLayer, direction='left') {
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

    const nodeWidth = 100
    const nodeHeight = 40
    const columnSpacing = 80
    const rowSpacing = 20

    function getLinePosition(fromId, toId) {
        if (columns.length === 0) return [{ x: 0, y: 0 }, { x: 0, y: 0 }]
        for (let colIndex = 0; colIndex < columns.length - 1; colIndex++) {
            const fromRowIndex = columns[colIndex].indexOf(fromId)
            if (fromRowIndex !== -1) {
                const toRowIndex = columns[colIndex + 1].indexOf(toId)
                if (toRowIndex !== -1) {
                    return [
                        {
                            x: (colIndex + 1) * (nodeWidth) + colIndex * columnSpacing,
                            y: fromRowIndex * (nodeHeight + rowSpacing) + nodeHeight / 2,
                        },
                        {
                            x: (colIndex + 1) * (nodeWidth) + (colIndex + 1) * columnSpacing,
                            y: toRowIndex * (nodeHeight + rowSpacing) + nodeHeight / 2,
                        }
                    ]
                }
            }
        }
        return [{ x: 0, y: 0 }, { x: 0, y: 0 }]
    }

    function nodeName(nodeId) {
        return graphData.nodes?.length ? graphData.nodes.find(el => el.id === nodeId)?.name : ''
    }

    function handleMove(nodeId, x, rowIndex) {
        console.log(x)
    }

    return (
        <div>
            {graphData.edges?.length && graphData.nodes?.length && columns.length &&
                (
                    <svg
                        width={nodeWidth * columns.length + columnSpacing * (columns.length - 1) + 2}
                        height={nodeHeight * maxHeight + rowSpacing * (maxHeight - 1) + 2}
                    >
                        {graphData.edges.map((edge, i) => {
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
                        })}
                        {columns.map((nodes, colIndex) =>
                            <svg
                                x={colIndex * (columnSpacing + nodeWidth)}
                            >
                                {nodes.map((nodeId, rowIndex) =>
                                    <GraphNode
                                        key={nodeId}
                                        y={rowIndex * (rowSpacing + nodeHeight)}
                                        nodeWidth={nodeWidth}
                                        nodeHeight={nodeHeight}
                                        nodeName={nodeName(nodeId)}
                                        handleMove={y => handleMove(nodeId, y, rowIndex)}
                                    />
                                )}
                            </svg>
                        )}
                    </svg>
                )}
        </div>
    )
}