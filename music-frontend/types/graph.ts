export type Node = { 
    id: string; 
    label: string; 
    x?: number; 
    y?: number; 
    fx?: number | null; 
    fy?: number | null 
};

export type Edge = { 
    source: string | Node; 
    target: string | Node; 
    similarity: number 
};

export type GraphData = {
    nodes: Node[];
    edges: {
        from: string;
        to: string;
        similarity: number;
    }[];
};