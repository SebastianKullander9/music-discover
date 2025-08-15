import { FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../errors.mts";
import * as musicbrainzService from "../services/musicbrainzService.mts";

export async function getHighLevelDataFromTracks(
    request: FastifyRequest<{ Querystring: { mbids: string } }>,
    reply: FastifyReply
) {
    const data = await musicbrainzService.getHighLevelDataFromTracks(request.query.mbids);

    if (!data) {
        throw new NotFoundError("data not found");
    }

    return { success: true, data: data};
}