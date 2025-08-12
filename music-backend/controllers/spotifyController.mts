import { FastifyRequest, FastifyReply } from "fastify";
import * as spotifyService from "../services/spotifyService.mts";

export async function getSpotifyAccessToken(
    request: FastifyRequest,
    reply: FastifyReply
) {
    try {
        const token = await spotifyService.getSpotifyAccessToken();
        return { access_token: token };
    } catch (err) {
        if (err instanceof Error) {
            reply.code(500).send({ error: err.message });
        } else {
            reply.code(500).send({ error: String(err) });
        }
    }
}

export async function getArtistById(
    request: FastifyRequest<{ Querystring: { id: string } }>,
    reply: FastifyReply
) {
    const { id } = request.query;

    if (!id) {
        return reply.code(400).send({ error: "Missing artist id in query parameter" });
    }

    try {
        const artist = await spotifyService.getArtistById(id);

        return artist;
    } catch (err) {
        if (err instanceof Error) {
            reply.code(500).send({ error: err.message });
        } else {
            reply.code(500).send({ error: String(err) });
        }
            }
}

export async function getArtistByName(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const { name } = request.query;

    if (!name) {
        return reply.code(400).send({ error: "Missing name of artist in query paramenter" });
    }

    try {
        const artist = await spotifyService.getArtistByName(name);

        return artist;
    } catch (err) {
        if (err instanceof Error) {
            reply.code(500).send({ error: err.message });
        } else {
            reply.code(500).send({ error: String(err) });
        }
    }
}