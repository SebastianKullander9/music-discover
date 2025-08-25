import { FastifyRequest, FastifyReply } from "fastify";
import * as searchService from "../services/searchService.mts";

export async function searchArtists(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const artists = await searchService.searchArtists(request.query.name);
    
    if (!artists) {
        throw new Error("FIX ERROR");
    }

    return { success: true, data: artists};
}