import { FastifyRequest, FastifyReply } from "fastify";
import * as spotifyService from "../services/spotifyService.mts";
import { NotFoundError, SpotifyAPIError } from "../errors.mts";

export async function getSpotifyAccessToken(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const token = await spotifyService.getSpotifyAccessToken();
        
        if (!token) {
            throw new SpotifyAPIError("Failed to retrieve access token");
        }

        return { success: true, data: { access_token: token }};
    } catch (err) {
        if (err instanceof Error) {
            throw new SpotifyAPIError(err.message)
        } else {
            throw new SpotifyAPIError(String(err));
        }
    }
}

export async function getArtistById(
    request: FastifyRequest<{ Querystring: { id: string } }>,
    reply: FastifyReply
) {
    const artist = await spotifyService.getArtistById(request.query.id);

    if (!artist) {
        throw new NotFoundError("Artist not found");
    }

    console.log(artist)

    return { success: true, data: artist }; 
}

export async function getArtistByName(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const artist = await spotifyService.getArtistByName(request.query.name);

    if (!artist) {
        throw new NotFoundError("Artist not found");
    }

    return { success: true, data: artist };
}