import ArtistSearch from "./ArtistSearch";
import { AudioLines } from "lucide-react";

export default function Menu() {
    return (
        <div className="w-full h-full bg-white drop-shadow-xl p-8 flex flex-col">
            <h1 className="text-lg font-bold">Music Discover</h1>
            <p>Search for an artist you like, and explore a node network of similar artists. The closer the node is to your liked artist, the better they match.</p>
            <ArtistSearch />
            
            <button className="flex flex-row p-4 gap-2 justify-center bg-gray-300 rounded-md shadow-sm items-center mt-20">
                <AudioLines size={24} className="text-gray-600" />
                <p className="font-semibold text-base text-gray-800">Discover</p>
            </button>
        </div>
    );
}