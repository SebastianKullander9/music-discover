import { FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../errors.mts";
import * as artistAggregatorService from "../services/artistAggregatorService.mts";

export async function aggregateArtistsAndAddNodesByName(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const artists = await artistAggregatorService.aggregateArtistsAndAddNodes(request.query.name);

    if (!artists) {
        throw new NotFoundError("Artist not found");
    }

    return {
        success: true,
        data: artists
    };
}