"use client";

import { useEffect, useState, useRef } from "react";
import renderGraph from "../components/renderGraph";
import { GraphData } from "@/types/graph";

export default function Graph() {
    const [data, setData] = useState<GraphData | null>(null);
    const ref = useRef<SVGSVGElement | null>(null);
    const [width, setWidth] = useState<number>();
    const [height, setHeight] = useState<number>();
    
    useEffect(() => {
        const handleResize = () => {
            setWidth(window.innerWidth);
            setHeight(window.innerHeight);
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch("http://localhost:3001/query/get-similar-artists-graph?name=JID", {
                method: "GET",
            });

            const data = await response.json();
            console.log(data.data)
            setData(data.data);
        }
        
        fetchData();
    }, [])

    useEffect(() => {
        if (!data || !ref.current || !width || !height) return;

        const simulation = renderGraph(ref.current, data, width, height);
        
        return () => {
            simulation.stop();
        };
    }, [data, width, height]);

    return <svg ref={ref} width={width} height={height}></svg>;
}