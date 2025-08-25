import { encode } from "punycode";
import { ListenbrainzAPIError } from "../errors.mts";
import * as query from "../sqlite/queries.mts";

type Artist = {
    name: string;
    id: string;
}

type ArtistSuggestion= {
    name: string;
    mbid: string;
}

export async function searchArtists(name: string, minResults = 5) {
    const cached = query.getArtistsByName(name);
    
    if (cached.length >= minResults) {
        return cached.slice(0, minResults);
    }

    const encodedQuery = encodeURIComponent(name);
    const url = `http://localhost:3001/listenbrainz/get-artist-by-name?name=${encodedQuery}`;

    const response = await fetch(url, {
        method: "GET",
    });

    if (!response.ok) {
        throw new ListenbrainzAPIError(
            `Listenbrainz API request failed: ${response.status} ${response.statusText}`,
            response.status
        )
    }

    const data = await response.json();
    const apiArtists = data.data.items?.[0]?.artists ?? [];

    const apiSuggestions = apiArtists.map((artist: Artist) => ({
        name: artist.name,
        mbid: artist.id
    }));

    apiSuggestions.forEach((artist: ArtistSuggestion) => query.addArtistIfNotExists( artist.name, artist.mbid ));

    const merged = [...cached] as ArtistSuggestion[];

    apiSuggestions.forEach((artist: ArtistSuggestion) => {
        if (!merged.some(a => a.mbid === artist.mbid)) {
            merged.push(artist)
        }
    });

    return merged.slice(0, minResults);
}
