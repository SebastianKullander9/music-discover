import { FastifyInstance } from "fastify";
import { getSimilarArtists, getArtistTopTags, getArtistTopTracks } from "../controllers/lastfmController.mts";

export default async function lastfmRoutes(fastify: FastifyInstance) {
    fastify.get("/get-similar-artists", {
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
                            type: "array"
                        }
                    }
                }
            }
        },
        handler: getSimilarArtists
    });

    fastify.get("/get-artist-top-tags", {
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
                            type: "array"
                        }
                    }
                }
            }
        },
        handler: getArtistTopTags
    });

    fastify.get("/get-artist-top-tracks", {
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
                            type: "array"
                        }
                    }
                }
            }
        },
        handler: getArtistTopTracks
    });
}