import { FastifyInstance } from "fastify";
import { getSpotifyAccessToken, getArtistById, getArtistByName } from "../controllers/spotifyController.mts";

export default async function spotifyRoutes(fastify: FastifyInstance) {
    fastify.get("/get-access-token", {
        schema: {
            response: {
                200: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    data: {
                        type: "object",
                        properties: {
                            access_token: { type: "string" }
                        },
                        required: ["access_token"]
                    }
                },
                required: ["success", "data"]
                }
            }
        },
        handler: getSpotifyAccessToken
    });

    fastify.get("/get-artist-by-id", {
        schema: {
            querystring: {
                type: "object",
                required: ["id"],
                properties: {
                    id: { type: "string", minLength: 1 }
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
                    },
                    required: ["success", "data"]
                }
            }
        },
        handler: getArtistById
    });
    
    fastify.get("/get-artist-by-name", {
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
        handler: getArtistByName
    });
}