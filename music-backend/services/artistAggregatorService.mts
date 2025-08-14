const BASE_URL = "http://localhost:3001";
const RELATED_LIMIT = 15;

async function fetchJSON(url: string) {
    const response = await fetch(url, { method: "GET" });
    if (!response.ok) throw new Error(`failed to fetch: ${url}`);
    return response.json();
}

export async function aggregateArtistsAndAddNodes(name: string) {
    const encodedName = encodeURIComponent(name);

    //get searched artists mbid from listenbrainz
    const artistData = await fetchJSON(`${BASE_URL}/listenbrainz/get-artist-by-name?name=${encodedName}`);
    const mainArtist = artistData.data.items[0]?.artists?.[0];
    if (!mainArtist) throw new Error("artist not found");

    //get main artists related artists
    const relatedData = await fetchJSON(`${BASE_URL}/listenbrainz/get-artists-related-artists?id=${mainArtist.id}`);
    const relatedNames = (relatedData.data.items as { name: string}[])
        .slice(0, RELATED_LIMIT)
        .map(a => a.name);
    const artistNames = [mainArtist.name, ...relatedNames];

    //get main and related artists spotify data
    const relatedArtists = (
        await Promise.all(artistNames.map(async artistName => {
            try {
                const spotifyData = await fetchJSON(`${BASE_URL}/spotify/get-artist-by-name?name=${encodeURIComponent(artistName)}`);
                const artistObject = spotifyData.data;

                return {
                    name: artistObject.name,
                    genres: artistObject.genres,
                    popularity: artistObject.popularity
                };
            } catch (err) {
                console.error(`failed to fetch spotify data for: ${artistName}. ${err}`);
                return null;
            }
        }))
    ).filter(Boolean);


    return relatedArtists;
}