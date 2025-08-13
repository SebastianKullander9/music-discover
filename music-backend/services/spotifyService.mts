import { SpotifyAPIError } from "../errors.mts";

import dotenv from "dotenv";
dotenv.config();

let spotifyToken = "";
let tokenExpiresAt = 0;

const client_id = process.env.CLIENT_ID!;
const client_secret = process.env.CLIENT_SECRET!;

if (!client_id || !client_secret) {
    throw new Error("Missing Spotify client ID or secret in env variables");
};

export async function getSpotifyAccessToken() {
    const now = Date.now();

    if (spotifyToken && now < tokenExpiresAt) {
        return spotifyToken;
    }

    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",

        },
        body: params.toString()
    });

    if (!response.ok) {
        throw new SpotifyAPIError(
            `Failed to get Spotify access token: ${response.status} ${response.statusText}`,
            response.status
        );
    }

    const data = await response.json();
    spotifyToken = data.access_token;
    tokenExpiresAt = now + data.expires_in * 1000 - 60000;

    return spotifyToken;
}

export async function getArtistById(artistId: string) {
    const token = await getSpotifyAccessToken();

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new SpotifyAPIError(
            `Spotify API request failed: ${response.status} ${response.statusText}`,
            response.status
        );
    }

    return await response.json();
}

export async function getArtistByName(artist: string) {
    const token = await getSpotifyAccessToken();

    const encodedQuery = encodeURIComponent(artist);
    const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=artist&market=US`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
    });

    if (!response.ok) {
        throw new SpotifyAPIError(
            `Spotify API request failed: ${response.status} ${response.statusText}`,
            response.status
        );
    }

    const data = await response.json();
    return data.artists.items[0];
}