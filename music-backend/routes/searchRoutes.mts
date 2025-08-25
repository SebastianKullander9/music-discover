import { FastifyInstance } from "fastify";
import { searchArtists } from "../controllers/searchController.mts";
import { stringify } from "querystring";

export default async function searchRoutes(fastify: FastifyInstance) {
    fastify.get("/search-artists", {
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
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    mbid: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        },
        handler: searchArtists
    });
}