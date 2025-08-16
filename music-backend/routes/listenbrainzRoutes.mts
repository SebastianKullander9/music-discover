import { FastifyInstance } from "fastify";
import { getArtistByName, getArtistsRelatedArtists, getArtistsTopTracks, getArtistByMbid } from "../controllers/listenbrainzController.mts";

export default async function listenbrainzRoutes(fastify: FastifyInstance) {
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

    fastify.get("/get-artist-by-mbid", {
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
        handler: getArtistByMbid
    });

    fastify.get("/get-artists-related-artists", {
        schema: {
            querystring: {
                type: "object",
                required: ["id"],
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
        handler: getArtistsRelatedArtists
    });

    fastify.get("get-artists-top-tracks", {
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
        handler: getArtistsTopTracks
    });
}