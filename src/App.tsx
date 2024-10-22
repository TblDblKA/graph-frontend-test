import React, { useState, useEffect, useMemo, useCallback } from 'react'
import './App.css'
import { Select } from './components/Select'
import { Graph } from './components/Graph'
import type { GraphStr } from './interfaces'

export const App = () => {
    const [graphsIdList, setGraphsIdList] = useState<number[]>([])
    const [selectedGraphId, setSelectedGraphId] = useState<string | undefined>(undefined)
    const [graph, setGraph] = useState<GraphStr>({} as GraphStr)

    useEffect(() => {
        fetch('api/graphs')
            .then((res) => res.json())
            .then((res: number[]) => { setGraphsIdList(res)})
    }, [])

    const graphComponent = useMemo(() => {
        return (
            Object.keys(graph).length > 0 && (
                <Graph
                    graphData={graph}
                />
            ))
    }, [graph])

    const handleSelect = useCallback((newVal: string) => {

        fetch(`api/graphs/${newVal}`)
            .then((res) => res.json())
            .then((data: GraphStr) => {setGraph(data)})
        setSelectedGraphId(newVal)
    }, [])
    return (
        <div id="app-wrapper">
            <Select
                data={graphsIdList}
                value={selectedGraphId}
                handleSelect={handleSelect}
            />
            {graphComponent}
        </div>
    )
}