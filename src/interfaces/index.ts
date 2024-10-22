export interface GraphStr {
    nodes: Node[]
    edges: Edge[]
}

export interface Edge {
    fromId: number
    toId: number
}

export interface Node {
    id: number
    name: string
}

export type Columns = number[][]