import React, { useState, useEffect, useMemo, useCallback } from 'react'
import './App.css'
import Select from './components/Select'
import Graph from './components/Graph'

export const App = () => {
    const [graphsIdList, setGraphsIdList] = useState<number[]>([])
    const [selectedGraphId, setSelectedGraphId] = useState<string | undefined>(undefined)
    const [graph, setGraph] = useState({})

    useEffect(() => {
        fetch('api/graphs')
            .then((res) => res.json())
            .then((res) => { setGraphsIdList(res)})
    }, [])

    const graphComponent = useMemo(() => {
        return (
            Object.keys(graph).length && (
                <Graph
                    graphData={graph}
                />
            ))
    }, [graph])

    // useEffect(() => {
    //
    // }, [selectedGraphId]);

    const handleSelect = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {

        fetch(`api/graphs/${event.currentTarget.value}`)
            .then((res) => res.json())
            .then(data => {setGraph(data)})
        setSelectedGraphId(event.currentTarget.value)
    }, [])
    return (
        <>
            <Select
                data={graphsIdList}
                value={selectedGraphId}
                handleSelect={handleSelect}
            />
            {graphComponent}
        </>
    )
}