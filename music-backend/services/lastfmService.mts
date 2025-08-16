import { LastFmError } from "../errors.mts";
import dotenv from "dotenv";
dotenv.config();

const api_key = process.env.LASTFM_API_KEY;

if (!api_key) {
    throw new Error("Missing lastfm api key in env variables");
}

export async function getSimilarArtists(mbid: string) {
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar&mbid=${mbid}&api_key=${api_key}&format=json`;
    
    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.1 ( kullander.sebastian@gmail.com )"
        }
    });

    if (!response.ok) {
        throw new LastFmError(
            `Last.fm API request failed: ${response.status} ${response.statusText}`,
            response.status
        );
    }

    const similarArtistsObject = await response.json();
    const similarArtistsArray = similarArtistsObject.similarartists.artist.map((artist: any) => ({
        name: artist.name,
        artistMbid: artist.mbid,
        match: artist.match
    }));

    return similarArtistsArray;
}

export async function getArtistTopTags(mbid: string) {
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.gettoptags&mbid=${mbid}&api_key=${api_key}&format=json`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.01 ( kullander.sebastian@gmail.com )"
        }
    });
    
    if (!response.ok) {
        throw new LastFmError(
            `Last.fm API request failed: ${response.status} ${response.statusText}`,
            response.status
        );
    }

    const data = await response.json();

    const cleanedTags = data.toptags.tag.map((tag: any) => ({
        name: tag.name,
        count: Number(tag.count)
    }));

    return await cleanedTags;
}

export async function getArtistTopTracks(mbid: string) {
    const url = `http://ws.audioscrobbler.com/2.0/?method=artist.gettoptracks&mbid=${mbid}&api_key=${api_key}&format=json`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.01 ( kullander.sebastian@gmail.com )"
        }
    });

    if (!response.ok) {
        throw new LastFmError(
            `Last.fm API request failed: ${response.status} ${response.statusText}`,
            response.status
        );
    }
    const data = await response.json();
    
    const cleanedTracks = data.toptracks.track.map((track: any) => ({
        name: track.name,
        trackMbid: track.mbid
    }));

    return await cleanedTracks;
}