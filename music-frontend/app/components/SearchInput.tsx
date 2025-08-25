import { useState, useEffect, useRef } from "react";

type ArtistSuggestion = {
    name: string;
    mbid: string;
};

type SearchInputProps = {
    onResults: (results: ArtistSuggestion[]) => void;
    results: ArtistSuggestion[];
}

export default function SearchInput({ onResults, results }: SearchInputProps) {
    const [query, setQuery] = useState("");
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (query.length < 2) {
            onResults([]);
            return;
        }

        const handler = setTimeout(async () => {
            abortControllerRef.current?.abort();
            const controller = new AbortController();
            abortControllerRef.current = controller;

            try {
                const response = await fetch(`http://localhost:3001/search/search-artists?name=${query}`, {
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
    }, [query, onResults]);

    return (
        <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for an artist..."
            className={`p-4 w-full border-1 border-gray-4 rounded-md ${results.length === 0 ? "" : "rounded-br-none rounded-bl-none"}`}
        />
    );
}