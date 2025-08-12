export async function searchArtistByName(name: string) {
    const encodedQuery = encodeURIComponent(name);
    const url = `https://musicbrainz.org/ws/2/artist?query=${encodedQuery}&fmt=json`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.1 ( kullander.sebastian@gmail.com )"
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch artist: ${response.statusText}`);
    }

    return await response.json();
}

export async function getArtistsRelatedArtists(id: string) {
    const url = `https://labs.api.listenbrainz.org/similar-artists/json?artist_mbids=${id}&algorithm=session_based_days_7500_session_300_contribution_5_threshold_10_limit_100_filter_True_skip_30`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.1 ( kullander.sebastian@gmail.com )"
        }
    });

    return await response.json();
}
