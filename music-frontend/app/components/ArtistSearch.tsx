import { useState } from "react";
import SearchInput from "./SearchInput";

type ArtistSuggestion = {
    name: string;
    mbid: string;
}

export default function ArtistSearch() {
    const [results, setResults] = useState<ArtistSuggestion[]>([]);
    const [searchedArtist, setSearchedArtist] = useState();

    const handleClick = (name: string, mbid: string) => {
        console.log(mbid);
    }

    return (
        <div className="w-full">
            <SearchInput onResults={setResults} results={results} />
            {results.length > 0 && (
                <ul className="border-b-1 border-l-1 border-r-1 flex flex-col items-center">
                    {results?.map((artist) => (
                        <li key={artist.mbid} onClick={() => handleClick(artist.name, artist.mbid)} className="cursor-pointer hover:bg-gray-300 p-2 w-full">
                            {artist.name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}