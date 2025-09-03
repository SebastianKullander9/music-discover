import { FastifyInstance } from "fastify";
import { getSimilarArtistsGraph, getAudioSimilarArtistsGraph, getTagSharedArtistsGraph } from "../controllers/neo4jQueryController.mts";

export default async function neo4jQueryRoutes(fastify: FastifyInstance) {
    fastify.get("/get-similar-artists-graph", {
        schema: {
            querystring: {
                type: "object",
                required: ["name", "mbid"],
                properties: {
                    name: { type: "string", minLength: 1 },
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
                            properties: {
                                nodes: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            label: { type: "string" },
                                        },
                                        required: ["id", "label"]
                                    }
                                },
                                edges: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            from: { type: "string" },
                                            to: { type: "string" },
                                            similarity: { type: "number" }
                                        },
                                        required: ["from", "to", "similarity"]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        handler: getSimilarArtistsGraph
    });

    fastify.get("/get-audio-similar-artists-graph", {
        schema: {
            querystring: {
                type: "object",
                required: ["name", "mbid"],
                properties: {
                    name: { type: "string", minLength: 1 },
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
                            properties: {
                                nodes: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            label: { type: "string" },
                                        },
                                        required: ["id", "label"]
                                    }
                                },
                                edges: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            from: { type: "string" },
                                            to: { type: "string" },
                                            similarity: { type: "number" }
                                        },
                                        required: ["from", "to", "similarity"]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        handler: getAudioSimilarArtistsGraph
    });

    fastify.get("/get-tag-shared-artists-graph", {
        schema: {
            querystring: {
                type: "object",
                required: ["name", "mbid"],
                properties: {
                    name: { type: "string", minLength: 1 },
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
                            properties: {
                                nodes: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            id: { type: "string" },
                                            label: { type: "string" },
                                        },
                                        required: ["id", "label"]
                                    }
                                },
                                edges: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            from: { type: "string" },
                                            to: { type: "string" },
                                            similarity: { type: "number" }
                                        },
                                        required: ["from", "to", "similarity"]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        handler: getTagSharedArtistsGraph
    });
}