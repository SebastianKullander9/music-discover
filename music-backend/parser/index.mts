import { extractAudioFeatures } from "./extractAudioFeatures.mts";
import {
    RawArtistDataResponse,
    ListenbrainzTag,
} from './dataTypes.mts';

//just for test
import rawData from '../../artistdata.json' with { type: 'json' };

export function parseForNeo4j(rawData: RawArtistDataResponse) {
    const data = rawData.data;

    return {
        artist: {
            mbid: data.artistMbid,
            name: data.name,
            spotifyPopularity: data.spotifyPopularity,
            spotifyFollowers: data.spotifyFollowers,
            spotifyGenres: data.spotifyGenres,
            topLastfmGenres: data.lastfmTags
                .filter(tag => tag.count > 5)
                .slice(0, 5)
                .map(tag => tag.name),
            topListenbrainzTags: normalizeTagsByPopularity(
                data.listenbrainzTags,
                data.spotifyFollowers
            ),
            audioFeatures: extractAudioFeatures(data.lastfmTopTracksWithData)
        },

        similarityRelationships: data.lastfmSimilarArtists.map(similar => ({
            targetArtistMbid: similar.artistMbid,
            targetArtistName: similar.name,
            similarity: parseFloat(similar.match),
            relationshipType: "SIMILAR_TO",
            source: "lastfm"
        }))
    };
}

function normalizeTagsByPopularity(tags: ListenbrainzTag[], spotifyFollowers: number) {
    if (!tags || !spotifyFollowers) return [];
    
    const popularityFactor = Math.log10(spotifyFollowers / 1000000 + 1);
    
    return tags
        .filter(tag => tag.count > 0)
        .map(tag => ({
        name: tag.name,
        rawWeight: tag.count,
        normalizedWeight: tag.count / popularityFactor,
        confidence: calculateTagConfidence(tag.count, popularityFactor)
        }))
        .sort((a, b) => b.normalizedWeight - a.normalizedWeight)
        .slice(0, 10);
}

function calculateTagConfidence(rawCount: number, popularityFactor: number) {
    const normalizedCount = rawCount / popularityFactor;
    
    if (normalizedCount >= 5) return 'high';
    if (normalizedCount >= 2) return 'medium';
    return 'low';
}

const parsedForNeo4j = parseForNeo4j(rawData);

console.log(parsedForNeo4j)
