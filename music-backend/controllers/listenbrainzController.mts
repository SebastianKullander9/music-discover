import { FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../errors.mts";
import * as listenbrainzService from "../services/listenbrainzService.mts";

export async function getArtistByName(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const artist = await listenbrainzService.searchArtistByName(request.query.name);

    if (!artist) {
        throw new NotFoundError("Artist not found");
    }

    return { success: true, data: { items: Array.isArray(artist) ? artist : [artist] } };
}

export async function getArtistByMbid(
    request: FastifyRequest<{ Querystring: { mbid: string } }>,
    reply: FastifyReply
) {
    const artist = await listenbrainzService.getArtistByMbid(request.query.mbid);

    if (!artist) {
        throw new NotFoundError("Artist not found");
    }

    return { success: true, data: artist };
}

export async function getArtistsRelatedArtists(
    request: FastifyRequest<{ Querystring: { id: string } }>,
    reply: FastifyReply
) {
    const artists = await listenbrainzService.getArtistsRelatedArtists(request.query.id);

    if (!artists) {
        throw new NotFoundError("Artists not found");
    }

    return { success: true, data: { items: Array.isArray(artists) ? artists : [artists] } };
}

export async function getArtistsTopTracks(
    request: FastifyRequest<{ Querystring: { mbid: string } }>,
    reply: FastifyReply
) {
    const tracks = await listenbrainzService.getArtistsTopTracks(request.query.mbid);

    if (!tracks) {
        throw new NotFoundError("Tracks not found");
    }

    return { success: true, data: tracks }
}