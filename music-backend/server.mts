import Fastify from "fastify";
import spotifyRoutes from "./routes/spotifyRoutes.mts";
import listenbrainzRoutes from "./routes/listenbrainzRoutes.mts";
import lastfmRoutes from "./routes/lastfmRoutes.mts";
import musicbrainzRoutes from "./routes/musicbrainzRoutes.mts";
import artistAggregatorRoutes from "./routes/artistAggregatorRoutes.mts";
import artistRoutes from "./routes/artistRoutes.mts";
import { AppError } from "./errors.mts";
import { driver } from './neo4j/driver.mts';

import dotenv from "dotenv";
dotenv.config();

const fastify = Fastify({ logger: true });

fastify.setErrorHandler((err, request, reply) => {
    request.log.error(err);

    if (err.validation) {
        return reply.status(400).send({
            success: false,
            message: "Invalid request parameters",
            details: err.validation
        });
    }

    if (err instanceof AppError) {
        return reply.status(err.statusCode).send({
            success: false,
            message: err.message
        });
    }

    reply.status(500).send({
        success: false,
        message: "Internal server error"
    });
});

fastify.register(spotifyRoutes, { prefix: "/spotify" });
fastify.register(listenbrainzRoutes, { prefix: "/listenbrainz"});
fastify.register(lastfmRoutes, { prefix: "/lastfm"});
fastify.register(musicbrainzRoutes, { prefix: "/musicbrainz" });
fastify.register(artistAggregatorRoutes, { prefix: "/api/aggregate" });
fastify.register(artistRoutes, { prefix: "/api/artist/" });

async function shutdown() {
    try {
        console.log('Shutting down, closing Neo4j driver...');
        await driver.close();
    } catch (err) {
        console.error('Error closing Neo4j driver', err);
    } finally {
        process.exit(0);
    }
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

async function start() {
    try {
        await fastify.listen({ port: 3001 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();