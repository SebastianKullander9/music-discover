import { FastifyInstance } from "fastify";
import { getSpotifyAccessToken, getArtistById, getArtistByName } from "../controllers/spotifyController.mts";

export default async function spotifyRoutes(fastify: FastifyInstance) {
    fastify.get("/get-access-token", getSpotifyAccessToken);
    fastify.get("/get-artist-by-id", getArtistById);
    fastify.get("/get-artist-by-name", getArtistByName);
}