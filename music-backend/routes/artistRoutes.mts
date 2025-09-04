import { FastifyInstance } from "fastify";
import { importArtists } from "../controllers/artistController.mts";

export default async function artistAggregatorRoutes(fastify: FastifyInstance) {
    fastify.get("/import-artists", {
        schema: {
            querystring: {
                type: "object",
                required: ["mbid"],
                properties: {
                    mbid: { type: "string", minLength: 1 }
                }
            },
            response: {
                200: {
                    type: "object",
                    properties: {
                        success: { type: "boolean" },
                        data: {
                            type: "object",
                            additionalProperties: true
                        }
                    }
                }
            }
        },
        handler: importArtists
    });
}