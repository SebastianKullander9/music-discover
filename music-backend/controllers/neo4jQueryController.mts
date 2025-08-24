import { FastifyRequest, FastifyReply } from "fastify";
import * as neo4jQueryService from "../services/neo4jQueryService.mts";

export async function getSimilarArtistsGraph(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const data = await neo4jQueryService.getSimilarArtistsGraph(request.query.name);

    if (!data) {
        throw new Error("Something went wrong.")
    }

    return { success: true, data: data };
}

export async function getAudioSimilarArtistsGraph(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const data = await neo4jQueryService.getAudioSimilarArtistsGraph(request.query.name);

    if (!data) {
        throw new Error("Something went wrong.")
    }

    return { success: true, data: data };
}

export async function getTagSharedArtistsGraph(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const data = await neo4jQueryService.getTagSharedArtistsGraph(request.query.name);

    if (!data) {
        throw new Error("Something went wrong.")
    }

    return { success: true, data: data };
}