import { parseForNeo4j } from "../parser/index.mts";
import { importArtistFull, computeAudioSimilarity } from "../neo4j/driver.mts";
import { ArtistDataType } from "../neo4j/dataTypes.mts";

type AggregatedArtist = {
    artistMbid: string;
    name: string;
    spotifyGenres: string[];
    spotifyPopularity: number;
    spotifyFollowers: number;
    listenbrainzTags: any[];
    lastfmTags: any[];
    lastfmSimilarArtists: any[];
    lastfmTopTracksWithData: any[];
};

export async function importArtists(mbid: string) {
    const response = await fetch(`http://localhost:3001/api/aggregate/aggregate-artist-data?mbid=${mbid}`, {
        method: "GET",
    });

    const data = await response.json();
    const artists = Object.values(data.data) as (AggregatedArtist | null)[];
    
    let addedArtists = [];
    for (const artist of artists) {
        if (!artist) continue;
        let parsedArtistsData = parseForNeo4j(artist);

        const added = await importArtistFull(parsedArtistsData as ArtistDataType);

        addedArtists.push(added)

    }

    await computeAudioSimilarity();

    return addedArtists;
}