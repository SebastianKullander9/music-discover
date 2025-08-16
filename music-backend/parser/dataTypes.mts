export interface RawArtistDataResponse {
    success: boolean;
    data: RawArtistData;
}

export interface RawArtistData {
    artistMbid: string;
    name: string;
    spotifyGenres: string[];
    spotifyPopularity: number;
    spotifyFollowers: number;
    listenbrainzTags: ListenbrainzTag[];
    lastfmTags: LastfmTag[];
    lastfmSimilarArtists: LastfmSimilarArtist[];
    lastfmTopTracksWithData: TrackWithData[];
}

export interface ListenbrainzTag {
    count: number;
    name: string;
}

export interface LastfmTag {
    name: string;
    count: number;
}

export interface LastfmSimilarArtist {
    name: string;
    artistMbid?: string;
    match: string;
}

export interface TrackWithData {
    mbid: string;
    name: string;
    data?: {
        highlevel?: {
            danceability?: {
                probability: number;
                value: string;
            };
            mood_happy?: {
                all: {
                    Happy?: number;
                    "Not happy"?: number;
                };
            };
            mood_acoustic?: {
                all: {
                    Acoustic?: number;
                    "Not acoustic"?: number;
                };
            };
            genre_rosamerica?: {
                value: string;
            };
        };
        metadata?: {
            tags?: {
                bpm?: string[];
            };
        };
    };
}



export interface ArtistParams {
    mbid: string;
    name: string;
    spotifyPopularity: number;
    spotifyFollowers: number;
    spotifyGenres: string[];
    topLastfmGenres: string[];
    danceability: number | null;
    valence: number | null;
    acousticness: number | null;
    tempo: number | null;
}