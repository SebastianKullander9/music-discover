import { FastifyInstance } from "fastify";
import { getHighLevelDataFromTracks } from "../controllers/musicbrainzController.mts";

export default async function listenbrainzRoutes(fastify: FastifyInstance) {
    fastify.get("/get-high-level-data-from-tracks", {
        schema: {
            querystring: {
                type: "object",
                required: ["mbids"],
                properties: {
                    mbids: { type: "string", minLength: 1 }
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
        handler: getHighLevelDataFromTracks
    });
}