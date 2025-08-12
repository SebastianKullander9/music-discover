import { FastifyInstance } from "fastify";
import { getArtistByName, getArtistsRelatedArtists } from "../controllers/listenbrainzController.mts";

export default async function spotifyRoutes(fastify: FastifyInstance) {
    fastify.get("/get-artist-by-name", getArtistByName);
    fastify.get("/get-artists-related-artists", getArtistsRelatedArtists);

}