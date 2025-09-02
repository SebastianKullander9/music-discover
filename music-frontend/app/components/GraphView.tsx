"use client";

import { useEffect, useState, useRef } from "react";
import renderGraph from "../components/renderGraph";
import { GraphData } from "@/types/graph";

interface GraphViewProps {
    containerRef: React.RefObject<HTMLDivElement>;
    data: GraphData | null;
}

export default function GraphView({ containerRef, data }: GraphViewProps) {
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
        if (!data || !ref.current || !width || !height) return;

        const simulation = renderGraph(ref.current, data, width, height);
        
        return () => {
            simulation.stop();
        };
    }, [data, width, height]);

    return <svg ref={ref} width={width} height={height}></svg>;
}