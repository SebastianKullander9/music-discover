"use client";

import { useEffect, useState, useRef } from "react";
import renderGraph from "../components/renderGraph";
import { GraphData } from "@/types/graph";

interface GraphViewProps {
    containerRef: React.RefObject<HTMLDivElement>;
    artistName: string | null;
}

export default function GraphView({ containerRef, artistName }: GraphViewProps) {
    const [data, setData] = useState<GraphData | null>(null);
    const ref = useRef<SVGSVGElement | null>(null);
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    
    useEffect(() => {
        if (!containerRef.current) return;

        const handleResize = () => {
            const { width, height } = containerRef.current.getBoundingClientRect();

            setWidth(width);
            setHeight(height);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, [containerRef]);

    useEffect(() => {
        if (artistName === "") return;

        const fetchData = async () => {
            const response = await fetch(`http://localhost:3001/query/get-similar-artists-graph?name=${artistName}`, {
                method: "GET",
            });

            const data = await response.json();
            console.log(data.data)
            setData(data.data);
        }
        
        fetchData();
    }, [artistName])

    useEffect(() => {
        if (!data || !ref.current || !width || !height) return;

        const simulation = renderGraph(ref.current, data, width, height);
        
        return () => {
            simulation.stop();
        };
    }, [data, width, height]);

    return <svg ref={ref} width={width} height={height}></svg>;
}