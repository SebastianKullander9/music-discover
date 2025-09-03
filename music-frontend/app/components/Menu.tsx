import React, { useState } from "react";
import ArtistSearch from "./ArtistSearch";
import { AudioLines } from "lucide-react";
import { Tag } from "lucide-react";
import { Zap } from "lucide-react";
import { CircleQuestionMark } from "lucide-react";

type QueryType = "similarity" | "audio" | "tag";

type Artist = {
    name: string;
    mbid: string;
}

interface MenuProps {
    setArtist: React.Dispatch<React.SetStateAction<Artist>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    queryType: QueryType;
    setQueryType: React.Dispatch<React.SetStateAction<QueryType>>;
}

export default function Menu({ setArtist, setIsLoading, setIsOpen, setIsModalOpen, queryType, setQueryType }: MenuProps) {
    const handleQueryType = (queryType: QueryType) => {
        setQueryType(queryType);
        setIsOpen(false);
        setIsLoading(true);
    };

    return (
        <div className="w-fill lg:w-full h-full px-2 lg:px-4 py-2 flex flex-col justify-between">
            <div>
                <h1 className="lg:block text-xl font-semibold pb-4">Discover Music Through Nodes</h1>
                <p className="text-gray-700 pb-2">Pick an artist you like, the main node. Similar artists appear around it, with closer nodes meaning stronger matches.</p>
                <ArtistSearch setArtist={setArtist} setIsLoading={setIsLoading} setIsOpen={setIsOpen} />
            </div>

            <div>
                <div className="flex flex-col gap-2 pb-16">
                    <h1 className="lg:block text-xl font-semibold">Discovery mode</h1>
                    <div className="flex gap-2">
                        <div onClick={() => handleQueryType("similarity")} className={`cursor-pointer text-gray-700 py-2 px-2 lg:px-4 bg-white rounded-2xl w-fit flex gap-2 ${queryType === "similarity" ? "border-2 border-blue-400" : ""}`}>
                            <Zap className="text-blue-500" />
                            <p>Similarity score</p>
                        </div>
                        <div className="lg:block text-gray-700 py-2 px-4 bg-white rounded-2xl">Best option</div>
                    </div>
                    <div onClick={() => handleQueryType("audio")} className={`cursor-pointer text-gray-700 py-2 px-2 lg:px-4 bg-white rounded-2xl w-fit flex gap-2 ${queryType === "audio" ? "border-2 border-blue-400" : ""}`}><AudioLines className="text-blue-500" /><p>Audio similarity</p></div>
                    <div onClick={() => handleQueryType("tag")} className={`cursor-pointer text-gray-700 py-2 px-2 lg:px-4 bg-white rounded-2xl w-fit flex gap-2 ${queryType === "tag" ? "border-2 border-blue-400" : ""}`}><Tag className="text-blue-500" /><p>Tag similarity</p></div>
                </div>
                
                <div onClick={() => setIsModalOpen(true)} className="flex gap-2 items-center pl-2 lg:pl-0 cursor-pointer hover:underline">
                    <CircleQuestionMark className="text-blue-500" size={20} />
                    <p className="text-sm text-gray-700">How does it work?</p>
                </div>
            </div>
        </div>
    );
}