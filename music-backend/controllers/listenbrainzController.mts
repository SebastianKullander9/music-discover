import { FastifyRequest, FastifyReply } from "fastify";
import * as listenbrainzService from "../services/listenbrainzService.mts";

export async function getArtistByName(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    try {
        const { name } = request.query;

        if (!name) {
            return reply.code(400).send({ error: "Missing artists name in query parameter" });
        }

        const artist = await listenbrainzService.searchArtistByName(name);

        return artist;
    } catch (err) {
        if (err instanceof Error) {
            reply.code(500).send({ error: err.message });
        } else {
            reply.code(500).send({ error: String(err) });
        }
    }
}

export async function getArtistsRelatedArtists(
    request: FastifyRequest<{ Querystring: { id: string } }>,
    reply: FastifyReply
) {
    try {
        const { id } = request.query;

        if (!id) {
            return reply.code(400).send({ error: "Missing artists name in query parameter" });
        }

        const artists = await listenbrainzService.getArtistsRelatedArtists(id);

        return artists;
    } catch (err) {
        if (err instanceof Error) {
            reply.code(500).send({ error: err.message });
        } else {
            reply.code(500).send({ error: String(err) });
        }
    }
}