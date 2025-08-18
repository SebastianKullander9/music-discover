const BASE_URL = "http://localhost:3000";
const RELATED_LIMIT = 15;

const BATCH_SIZE = 25;
const ACOUSTICBRAINZ_BASE_URL = "https://acousticbrainz.org/api/v1/high-level";

type ApiTrackData = Record<string, any[]> & {
    mbid_mapping?: Record<string, unknown>
};

type Song = {
    name: string;
    trackMbid?: string;
}

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

export async function aggregateArtistData(name: string) {
    const encodedName = encodeURIComponent(name);

    //get searched artists mbid from listenbrainz
    const artistData = await fetchJSON(`${BASE_URL}/listenbrainz/get-artist-by-name?name=${encodedName}`);
    const mainArtist = artistData.data.items[0]?.artists?.[0];
    if (!mainArtist) throw new Error("artist not found");

    //get main artists related artists
    const relatedData = await fetchJSON(`${BASE_URL}/listenbrainz/get-artists-related-artists?id=${mainArtist.id}`);
    const relatedArtists = (relatedData.data.items as { name: string, artist_mbid: string}[])
        .slice(0, RELATED_LIMIT)
        .map(a => ({ name: a.name, artistMbid: a.artist_mbid }));
    
    const mainAndRelatedArtists = [
        { name: mainArtist.name, artistMbid: mainArtist.id },
        ...relatedArtists
    ]

    const artistsAggregatedData = (
        await Promise.all(mainAndRelatedArtists.map( async artist => {
            try {
                //spotify data
                const spotifyData = await fetchJSON(`${BASE_URL}/spotify/get-artist-by-name?name=${encodeURIComponent(artist.name)}`);
                const artistObjectSpotify = spotifyData.data;

                //listenbrainz data
                const listenbrainzData = await fetchJSON(`${BASE_URL}/listenbrainz/get-artist-by-name?name=${encodeURIComponent(artist.name)}`);
                const artistObjectListenbrainz = listenbrainzData.data;//VALDATE THAT ITS THE EXPECTED ARTIST BEFORE ADDING

                //lastfm data
                //similar artists
                const lastfmSimilarArtists = await fetchJSON(`${BASE_URL}/lastfm/get-similar-artists?mbid=${artist.artistMbid}`);
                const similarArtistsLastfm = lastfmSimilarArtists.data;

                //artists top tags
                const lastfmTopTags = await fetchJSON(`${BASE_URL}/lastfm/get-artist-top-tags?mbid=${artist.artistMbid}`);
                const lastfmTopTagsData = lastfmTopTags.data;

                //artists top tracks
                const lastfmTopTracks = await fetchJSON(`${BASE_URL}/lastfm/get-artist-top-tracks?mbid=${artist.artistMbid}`);
                const lastfmTopTracksData = lastfmTopTracks.data;
                const lastfmTopTracksWithData = await getAllSongData(lastfmTopTracksData);

                return {
                    artistMbid: artist.artistMbid,
                    name: artist.name,
                    spotifyGenres: artistObjectSpotify.genres,
                    spotifyPopularity: artistObjectSpotify.popularity,
                    spotifyFollowers: artistObjectSpotify.followers.total,
                    listenbrainzTags: artistObjectListenbrainz.items[0].artists[0].tags,
                    lastfmTags: lastfmTopTagsData,
                    lastfmSimilarArtists: similarArtistsLastfm,
                    lastfmTopTracksWithData: lastfmTopTracksWithData
                }
            } catch (err) {
                console.error("something went wrong")
                return null;
            }
        }))
    )

    return artistsAggregatedData;

}