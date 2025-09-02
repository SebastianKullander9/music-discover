import { useState } from "react";
import ArtistSearch from "./ArtistSearch";
import { AudioLines } from "lucide-react";
import { Tag } from "lucide-react";
import { Zap } from "lucide-react";
import { CircleQuestionMark } from "lucide-react";

type Artist = {
    name: string;
    mbid: string;
}

interface MenuProps {
    setArtist: React.Dispatch<React.SetStateAction<Artist>>
}

export default function Menu({ setArtist }: MenuProps) {
    const [discoveryMode, setDiscoverMode] = useState("similarity");

    return (
        <div className="w-full h-full px-4 py-2 flex flex-col justify-between">
            <div>
                <h1 className="text-xl font-semibold pb-4">Discover Music Through Nodes</h1>
                <p className="text-gray-700 pb-2">Pick an artist you like, the main node. Similar artists appear around it, with closer nodes meaning stronger matches.</p>
                <ArtistSearch setArtist={setArtist}/>
            </div>

            <div>
                <div className="flex flex-col gap-2 pb-16">
                    <h1 className="text-xl font-semibold">Discovery mode</h1>
                    <div className="flex gap-2">
                        <div className={`cursor-pointer text-gray-700 py-2 px-4 bg-white rounded-2xl w-fit flex gap-2 ${discoveryMode === "similarity" ? "border-2 border-blue-400" : ""}`}>
                            <Zap className="text-blue-500" />
                            <p>Similarity score</p>
                        </div>
                        <div className="text-gray-700 py-2 px-4 bg-white rounded-2xl">Best option</div>
                    </div>
                    <div className={`cursor-pointer text-gray-700 py-2 px-4 bg-white rounded-2xl w-fit flex gap-2`}><AudioLines className="text-blue-500" /><p>Audio similarity</p></div>
                    <div className={`cursor-pointer text-gray-700 py-2 px-4 bg-white rounded-2xl w-fit flex gap-2`}><Tag className="text-blue-500" /><p>Tag similarity</p></div>
                </div>

                <div className="flex gap-2 items-center">
                    <CircleQuestionMark className="text-blue-500" size={20} />
                    <p className="text-sm text-gray-700">How does it work?</p>
                </div>
            </div>

        </div>
    );
}