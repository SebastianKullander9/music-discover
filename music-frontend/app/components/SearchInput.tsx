import { useState, useEffect, useRef } from "react";

type ArtistSuggestion = {
    name: string;
    mbid: string;
};

type SearchInputProps = {
    onResults: (results: ArtistSuggestion[]) => void;
    results: ArtistSuggestion[];
    queryState: string;
    setQueryState: React.Dispatch<React.SetStateAction<string>>;
}

export default function SearchInput({ onResults, results, queryState, setQueryState }: SearchInputProps) {
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (queryState.length < 2) {
            onResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const response = await fetch(`http://localhost:3001/search/search-artists?name=${queryState}`, {
                    method: "GET",
                    signal: controller.signal
                });

                if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

                const data: { success: boolean; data: ArtistSuggestion[] } = await response.json();
                onResults(data.data);
            } catch (err: unknown) {
                if (err instanceof Error) {
                    if (err.name !== "AbortError") {
                    console.error("Search request failed:", err.message);
                    onResults([]);
                    }
                } else {
                    console.error("Search request failed with unknown error:", err);
                    onResults([]);
                }
            }
        }, 300);

        return () => clearTimeout(handler);
    }, [queryState, onResults]);

    return (
        <input 
            type="text"
            value={queryState}
            onChange={(e) => setQueryState(e.target.value)}
            placeholder="Search for an artist..."
            className={`p-4 w-full focus:outline-none focus:ring-0 bg-white rounded-xl`}
        />
    );
}