export interface ArtistDataType {
    artist: {
        mbid: string;
        name: string;
        spotifyPopularity: number;
        spotifyFollowers: number;
        spotifyGenres: string[];
        topLastfmGenres: string[];
        topListenbrainzTags: ListenbrainzTag[];
        audioFeatures: AudioFeatures;
    },
    similarityRelationships: RelationshipType[];
}

interface ListenbrainzTag {
    name: string;
    rawWeight: number;
    normalizedWeight: number;
    confidence: string;
}

interface AudioFeatures {
    danceability: number;
    valence: number;
    acousticness: number;
    tempo: number;
}

interface RelationshipType {
    targetArtistMbid?: string;
    targetArtistName: string;
    similarity: number;
    relationshipType: string;
    source: string;
}