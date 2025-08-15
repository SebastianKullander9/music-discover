import { FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../errors.mts";
import * as lastfmService from "../services/lastfmService.mts";

export async function getSimilarArtists(
    request: FastifyRequest<{ Querystring: { mbid: string } }>,
    reply: FastifyReply
) {
    const data = await lastfmService.getSimilarArtists(request.query.mbid);

    if (!data) {
        throw new NotFoundError("Artists not found");
    }

    return { success: true, data: data.similarartists.artist};
}

export async function getArtistTopTags(
    request: FastifyRequest<{ Querystring: { mbid: string } }>,
    reply: FastifyReply
) {
    const data = await lastfmService.getArtistTopTags(request.query.mbid);

    if (!data) {
        throw new NotFoundError("Artist not found");
    }

    return { success: true, data: data.toptags.tag };
}

export async function getArtistTopTracks(
    request: FastifyRequest<{ Querystring: { mbid: string } }>,
    reply: FastifyReply
) {
    const data = await lastfmService.getArtistTopTracks(request.query.mbid);

    if (!data) {
        throw new NotFoundError("Artist not found");
    }

    return { success: true, data: data.toptracks.track };
}