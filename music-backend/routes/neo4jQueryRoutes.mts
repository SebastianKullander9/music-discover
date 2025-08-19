import { FastifyInstance } from "fastify";
import { getSimilarArtistsGraph } from "../controllers/neo4jQueryController.mts";

export default async function neo4jQueryRoutes(fastify: FastifyInstance) {
    fastify.get("/get-similar-artists-graph", {
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
}