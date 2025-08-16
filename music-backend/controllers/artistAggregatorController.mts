import { FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../errors.mts";
import * as artistAggregatorService from "../services/artistAggregatorService.mts";

export async function aggregateArtistData(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const aggregatedData = await artistAggregatorService.aggregateArtistData(request.query.name);

    if (!aggregatedData) {
        throw new NotFoundError("aggregated data not found");
    }

    return {
        success: true,
        data: aggregatedData[2]
    };
}