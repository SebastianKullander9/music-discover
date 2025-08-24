"use client";

import { useRef, useState } from "react";
import GraphView from "./components/GraphView";
import Menu from "./components/Menu";

export default function Home() {
	const [artistName, setArtistName] = useState<string>("");
	const graphContainerRef = useRef<HTMLDivElement>(null);

	return (
		<div className="bg-gray-100 h-screen w-screen flex flex-row">
			<div className="w-2/10 hidden lg:block">
				<Menu state={artistName} setState={setArtistName} />
			</div>
			<div className="w-full lg:w-8/10" ref={graphContainerRef}>
				<GraphView containerRef={graphContainerRef as React.RefObject<HTMLDivElement>} artistName={artistName} />
			</div>
		</div>
	);
}
