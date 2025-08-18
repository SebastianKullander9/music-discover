import { FastifyRequest, FastifyReply } from "fastify";
import { NotFoundError } from "../errors.mts";
import * as artistService from "../services/artistService.mts";

export async function importArtists(
    request: FastifyRequest<{ Querystring: { name: string } }>,
    reply: FastifyReply
) {
    const data = await artistService.importArtists(request.query.name);

    if (!data) {
        throw new Error("Something went wrong.")
    }

    return { success: true, data: data };
}