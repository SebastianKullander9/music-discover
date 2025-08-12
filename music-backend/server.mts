import Fastify from "fastify";
import spotifyRoutes from "./routes/spotifyRoutes.mts";
import listenbrainzRoutes from "./routes/listenbrainzRoutes.mts";

import dotenv from "dotenv";
dotenv.config();

const fastify = Fastify({ logger: true });

fastify.register(spotifyRoutes, { prefix: "/spotify" });
fastify.register(listenbrainzRoutes, { prefix: "/listenbrainz"})

async function start() {
    try {
        await fastify.listen({ port: 3001 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();