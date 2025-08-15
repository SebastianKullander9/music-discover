export async function getHighLevelDataFromTracks(mbids: string) {
    const url = `https://acousticbrainz.org/api/v1/high-level?recording_ids=${mbids}&map_classes=true`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.1 ( kullander.sebastian@gmail.com )"
        }
    });

    //error handliing

    return await response.json();
}