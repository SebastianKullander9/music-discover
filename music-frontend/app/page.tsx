"use client";

import { useRef, useState, useEffect } from "react";
import GraphView from "./components/GraphView";
import Menu from "./components/Menu";
import { Loader2 } from "lucide-react";
import { GraphData } from "@/types/graph";

export default function Home() {
	const [artist, setArtist] = useState({ name: "", mbid: "" });
	const [data, setData] = useState<GraphData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const graphContainerRef = useRef<HTMLDivElement>(null);

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
            setIsLoading(false);
        }
        
        fetchData();
    }, [artist, setIsLoading]);

	return (
		<div className="bg-blue-100 h-screen w-screen flex flex-row">
			<div className="w-2/10 hidden lg:block">
				<Menu setArtist={setArtist} setIsLoading={setIsLoading} />
			</div>
			<div className="relative w-full lg:w-8/10 bg-white m-2 rounded-3xl inset-shadow-xs" ref={graphContainerRef}>
				
				{artist.name === "" || artist.mbid === "" ? 
					<div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
					<p className="text-sm text-gray-700">No artist has been searched yet...</p>
					</div> 
				: isLoading ?
					<div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
						<p className="text-sm text-gray-700">Loading artist data...</p>
					</div>
				:
					<GraphView containerRef={graphContainerRef as React.RefObject<HTMLDivElement>} data={data}/>
				}
			</div>
		</div>
	);
}
