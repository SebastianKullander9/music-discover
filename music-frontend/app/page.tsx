"use client";

import { useRef, useState, useEffect } from "react";
import GraphView from "./components/GraphView";
import Menu from "./components/Menu";
import Hamburger from "hamburger-react";
import Modal from "./components/Modal";
import { Loader2 } from "lucide-react";
import { GraphData } from "@/types/graph";

type QueryType = "similarity" | "audio" | "tag";

const queryTypeUrls = {
	similarity: "get-similar-artists-graph",
	audio: "get-audio-similar-artists-graph",
	tag: "get-tag-shared-artists-graph"
};

export default function Home() {
	const [artist, setArtist] = useState({ name: "", mbid: "" });
	const [data, setData] = useState<GraphData | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [queryType, setQueryType] = useState<QueryType>("similarity");
	const graphContainerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
        if (artist.name === "" || artist.mbid === "") return;

        const fetchData = async () => {
			console.time("fetchData")
			
			try {
				const addedToNeo4j = await fetch(`http://localhost:3001/api/artist/import-artists?mbid=${artist.mbid}`, {
					method: "GET"
				});

				await addedToNeo4j.json();

				const response = await fetch(`http://localhost:3001/query/${queryTypeUrls[queryType]}?name=${artist.name}&mbid=${artist.mbid}`, {
					method: "GET",
				});

				const data = await response.json();
				console.log(data.data)
				setData(data.data);
				
			} finally {
				setIsLoading(false);
				console.timeEnd("fetchData");
			}
            
        }
        
        fetchData();
    }, [artist, queryType]);

	return (
		<div className="relative bg-blue-100 h-screen w-screen flex flex-row">
			<div className="hidden lg:block lg:w-2/10">
				<Menu setArtist={setArtist} setIsLoading={setIsLoading} setIsOpen={setIsOpen} setIsModalOpen={setIsModalOpen} queryType={queryType} setQueryType={setQueryType} />
			</div>
			<div className={`
				lg:hidden fixed max-w-110 h-full z-50 bg-blue-100 transform transition-transform duration-300
				${isOpen ? "translate-x-0" : "-translate-x-full"}
			`}>
				<Menu setArtist={setArtist} setIsLoading={setIsLoading} setIsOpen={setIsOpen} setIsModalOpen={setIsModalOpen} queryType={queryType} setQueryType={setQueryType} />
			</div>
			<div className="relative w-full lg:w-8/10 bg-white lg:m-2 lg:rounded-3xl inset-shadow-xs" ref={graphContainerRef}>
				{artist.name === "" || artist.mbid === "" ? 
					<div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
					<p className="text-sm text-gray-700">No artist has been searched yet...</p>
					</div> 
				: isLoading ?
					<div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
						<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
						<p className="text-sm text-gray-700">Loading artist data...</p>
					</div>
				: data !== null && data.edges.length === 0 ?
					<div className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2">
						<p className="text-sm text-gray-700">{`Could not get ${queryType} data from ${artist.name}. ${queryType === "audio" ? "This is a know limitation of audio similarity, some artists songs lacks analyzed track data" : ""}`}</p>
					</div> 
				:
					<GraphView containerRef={graphContainerRef as React.RefObject<HTMLDivElement>} data={data}/>
				}
			</div>

			<div className="lg:hidden absolute top-0 right-0 z-50 text-black">
                <Hamburger
                    toggled={isOpen}
                    toggle={setIsOpen}
                    size={26}
                    label="Show menu"
                    distance="lg"
                />
            </div>

			<Modal isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen}>
			</Modal>
		</div>
	);
}
