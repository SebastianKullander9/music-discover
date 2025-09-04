import { driver } from "../neo4j.mts";
import pLimit from "p-limit";
const limit = pLimit(50);

const BASE_URL = "http://localhost:3001";
const RELATED_LIMIT = 50;

const BATCH_SIZE = 25;
const ACOUSTICBRAINZ_BASE_URL = "https://acousticbrainz.org/api/v1/high-level";

type ApiTrackData = Record<string, any[]> & {
    mbid_mapping?: Record<string, unknown>
};

type Song = {
    name: string;
    trackMbid?: string;
}

type SimilarArtist = {
    name: string;
    artistMbid: string;
    [key: string]: unknown;
};


async function fetchJSON(url: string) {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`fail ed to fetch: ${url}`);
    return response.json();
}

async function fetchBatch(trackMbids: string[]): Promise<ApiTrackData> {
    const ids = trackMbids.join(";");
    const response = await fetch(`${ACOUSTICBRAINZ_BASE_URL}?recording_ids=${ids}&map_classes=true`, {
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.1 (kullander.sebastian@gmail.com)",
        }
    });

    if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${await response.text()}`);
    }

    return response.json();
}

async function fetchWithRateLimit(url: string, retries = 3): Promise<any> {
    for (let attempt = 0; attempt <= retries; attempt++) {
        const resp = await fetch(url);

        if (resp.ok) {
            return resp.json();
        }

        if (resp.status === 429) {
            const waitSec = parseInt(resp.headers.get("X-RateLimit-Reset-In") || "2", 10);
            console.warn(`Rate limited. Waiting ${waitSec}s before retry...`);
            await new Promise(res => setTimeout(res, waitSec * 1000));
            continue;
        }

        if (attempt < retries) {
            await new Promise(res => setTimeout(res, 500 * 2 ** attempt));
            continue;
        }

        throw new Error(`Failed to fetch ${url}: ${resp.status}`);
    }
}

async function getAllSongData(songs: Song[]): Promise<{ mbid: string; name?: string; data: any }[]> {
    const validSongs = songs.filter(s => s.trackMbid);

    const batches = [];
    for (let i = 0; i < validSongs.length; i += BATCH_SIZE) {
        batches.push(validSongs.slice(i, i + BATCH_SIZE));
    }

    const results = await Promise.all(
        batches.map(batch => 
            fetchBatch(batch.map(s => s.trackMbid!))
        )
    );

    const allData = results.flatMap(data =>
        Object.entries(data)
            .filter(([key]) => key !== "mbid_mapping")
            .map(([mbid, value]) => {
                const song = songs.find(s => s.trackMbid === mbid);
                return { mbid, name: song?.name, data: Array.isArray(value) ? value[0] : value[0] };
            })
    );

    return allData;
}

async function getExistingArtistMbids(): Promise<Set<string>> {
    const session = driver.session();
    try {
        const result = await session.run(`
            MATCH (a:Artist)
            WHERE a.mbid IS NOT NULL
            RETURN trim(a.mbid) AS mbid
        `);

        const mbids = result.records.map(r => r.get("mbid"));
        return new Set(mbids);
    } finally {
        await session.close();
    }
}

export async function aggregateArtistData(mainArtistMbid: string) {
    //const encodedName = encodeURIComponent(name);

    //get searched artists name from listenbrainz
    const mainArtistObj = await fetchJSON(`${BASE_URL}/listenbrainz/get-artist-by-mbid?mbid=${mainArtistMbid}`);
    const mainArtist = mainArtistObj.data;
    if (!mainArtist) throw new Error("artist not found");

    //get main artists related artists
    const lastfmSimilarArtists = await fetchJSON(`${BASE_URL}/lastfm/get-similar-artists?mbid=${mainArtistMbid}`);
    const similarArtistsLastfm: SimilarArtist[] = lastfmSimilarArtists.data;
    const strippedSimilarArtistsLastFm: SimilarArtist[] = (similarArtistsLastfm as SimilarArtist[])
        .filter((a): a is { name: string; artistMbid: string } =>
            typeof a.artistMbid === "string" && a.artistMbid.trim() !== ""
        )
        .slice(0, RELATED_LIMIT)
        .map(a => ({ name: a.name, artistMbid: a.artistMbid }));

    const mainAndRelatedArtists = [
        { name: mainArtist.name, artistMbid: mainArtistMbid },
        ...strippedSimilarArtistsLastFm
    ]

    const existingMbids = await getExistingArtistMbids();
    const newArtists = mainAndRelatedArtists.filter(
        artist => !existingMbids.has(artist.artistMbid)
    );

    const artistsAggregatedData = (
        await Promise.all(newArtists.map( artist =>
            limit(async () => {
                try {
                const [spotifyData, lastfmSimilar, lastfmTopTags, lastfmTopTracks] = await Promise.all([
                    fetchWithRateLimit(`${BASE_URL}/spotify/get-artist-by-name?name=${encodeURIComponent(artist.name)}`),
                    fetchWithRateLimit(`${BASE_URL}/lastfm/get-similar-artists?mbid=${artist.artistMbid}`),
                    fetchWithRateLimit(`${BASE_URL}/lastfm/get-artist-top-tags?mbid=${artist.artistMbid}`),
                    fetchWithRateLimit(`${BASE_URL}/lastfm/get-artist-top-tracks?mbid=${artist.artistMbid}`)
                ]);

                const artistObjectSpotify = spotifyData.data;
                const lastfmTopTagsData = lastfmTopTags.data;
                const similarArtistsLastfm = lastfmSimilar.data;
                const lastfmTopTracksData = lastfmTopTracks.data;
                const lastfmTopTracksWithData = await getAllSongData(lastfmTopTracksData);

                return {
                    artistMbid: artist.artistMbid,
                    name: artist.name,
                    spotifyGenres: artistObjectSpotify.genres,
                    spotifyPopularity: artistObjectSpotify.popularity,
                    spotifyFollowers: artistObjectSpotify.followers.total,
                    //listenbrainzTags: artistObjectListenbrainz.items[0].artists[0].tags,
                    lastfmTags: lastfmTopTagsData,
                    lastfmSimilarArtists: similarArtistsLastfm,
                    lastfmTopTracksWithData: lastfmTopTracksWithData
                }
            } catch (err) {
                console.error(`Failed to aggregate artist ${artist.name} (${artist.artistMbid}):`, err);
            }
            })
            
        ))
    )

    return artistsAggregatedData;
}