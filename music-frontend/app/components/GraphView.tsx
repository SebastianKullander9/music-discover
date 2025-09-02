"use client";

import { useEffect, useState, useRef } from "react";
import renderGraph from "../components/renderGraph";
import { GraphData } from "@/types/graph";

type Artist = {
    name: string;
    mbid: string;
}

interface GraphViewProps {
    containerRef: React.RefObject<HTMLDivElement>;
    artist: Artist;
}

export default function GraphView({ containerRef, artist }: GraphViewProps) {
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
        if (artist.name === "" || artist.mbid === "") return;

        

        const fetchData = async () => {
            const addedToNeo4j = await fetch(`http://localhost:3001/api/artist/import-artists?mbid=${artist.mbid}`, {
                method: "GET"
            });

            const addedArtists = await addedToNeo4j.json();
            console.log(addedArtists.data);

            const response = await fetch(`http://localhost:3001/query/get-similar-artists-graph?name=${artist.name}&mbid=${artist.mbid}`, {
                method: "GET",
            });

            const data = await response.json();
            console.log(data.data)
            setData(data.data);
        }
        
        fetchData();
    }, [artist])

    useEffect(() => {
        if (!data || !ref.current || !width || !height) return;

        const simulation = renderGraph(ref.current, data, width, height);
        
        return () => {
            simulation.stop();
        };
    }, [data, width, height]);

    return <svg ref={ref} width={width} height={height}></svg>;
}