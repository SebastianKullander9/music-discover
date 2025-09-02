"use client";

import { useRef, useState } from "react";
import GraphView from "./components/GraphView";
import Menu from "./components/Menu";

export default function Home() {
	const [artist, setArtist] = useState({ name: "", mbid: "" });
	const graphContainerRef = useRef<HTMLDivElement>(null);

	return (
		<div className="bg-blue-100 h-screen w-screen flex flex-row">
			<div className="w-2/10 hidden lg:block">
				<Menu setArtist={setArtist} />
			</div>
			<div className="w-full lg:w-8/10 bg-white m-2 rounded-3xl inset-shadow-xs" ref={graphContainerRef}>
				<GraphView containerRef={graphContainerRef as React.RefObject<HTMLDivElement>} artist={artist} />
			</div>
		</div>
	);
}
