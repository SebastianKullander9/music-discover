import { FastifyInstance } from "fastify";
import { aggregateArtistData } from "../controllers/artistAggregatorController.mts";

export default async function artistAggregatorRoutes(fastify: FastifyInstance) {
    fastify.get("/aggregate-artist-data", {
        schema: {
            querystring: {
                type: "object",
                required: ["name"],
                properties: {
                    name: { type: "string", minLength: 1 }
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
        handler: aggregateArtistData
    });
}