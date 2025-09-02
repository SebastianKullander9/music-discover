import { useState } from "react";
import SearchInput from "./SearchInput";

type Artist = {
    name: string;
    mbid: string;
}

interface ArtistSearchProps {
    setArtist: React.Dispatch<React.SetStateAction<Artist>>;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function ArtistSearch({ setArtist, setIsLoading }: ArtistSearchProps) {
    const [results, setResults] = useState<Artist[]>([]);
    const [searchedArtist, setSearchedArtist] = useState("");
    const [query, setQuery] = useState("");
    

    const handleClick = (name: string, mbid: string) => {
        setArtist({name, mbid});
        setIsLoading(true);
        setQuery("");
        setResults([]);
    }

    return (
        <div className="w-full rounded-2xl inset-shadow-xs">
            <SearchInput onResults={setResults} results={results} queryState={query} setQueryState={setQuery}/>
            {results.length > 0 && (
                <ul className="flex flex-col items-center bg-white rounded-xl mt-2">
                    {results?.map((artist) => (
                        <div key={artist.mbid} className="hover:bg-gray-100 w-full first:rounded-tr-xl first:rounded-tl-xl last:rounded-br-xl last:rounded-bl-xl">
                            <li onClick={() => handleClick(artist.name, artist.mbid)} className="cursor-pointer p-4 w-full">
                                {artist.name}
                            </li>
                        </div>
                    ))}
                </ul>
            )}
        </div>
    );
}