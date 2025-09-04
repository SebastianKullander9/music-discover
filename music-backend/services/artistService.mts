import { parseForNeo4j } from "../parser/index.mts";
import { importArtistFull, computeAudioSimilarity } from "../neo4j/driver.mts";
import { ArtistDataType } from "../neo4j/dataTypes.mts";
import { aggregateArtistData } from "./artistAggregatorService.mts";

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

export type SimilarityRelationship = {
    mainId: string;
    targetId: string;
    similarity: number;
    source: string;
    relationshipType: string;
};

export async function importArtists(mbid: string) {
    const response = await fetch(`http://localhost:3001/api/aggregate/aggregate-artist-data?mbid=${mbid}`, {
        method: "GET",
    });

    const data = await response.json();
    const artists = Object.values(data.data) as (AggregatedArtist | null)[];

    const parsedArtists = artists
        .filter((a): a is AggregatedArtist => a !== null)
        .map(a => {
            const parsed = parseForNeo4j(a) as ArtistDataType;
            return {
                ...parsed,
                audioTempo: parsed.audioFeatures?.tempo ?? null,
                audioValence: parsed.audioFeatures?.valence ?? null,
                audioDanceability: parsed.audioFeatures?.danceability ?? null,
                audioAcousticness: parsed.audioFeatures?.acousticness ?? null,
            };
        });

    console.log(parsedArtists)
    
    const allRelationships: SimilarityRelationship[] = [];

    for (const artist of parsedArtists) {
        for (const rel of artist.similarityRelationships || []) {
            allRelationships.push({
                mainId: artist.mbid,
                targetId: rel.targetArtistMbid || `NAME::${rel.targetArtistName}`,
                similarity: rel.similarity,
                source: rel.source,
                relationshipType: rel.relationshipType,
            });
        }
    }

    const added = await importArtistFull(parsedArtists, allRelationships);

    await computeAudioSimilarity(parsedArtists.map(a => a.mbid));

    return added;
}