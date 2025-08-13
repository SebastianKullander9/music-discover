import Fastify from "fastify";
import spotifyRoutes from "./routes/spotifyRoutes.mts";
import listenbrainzRoutes from "./routes/listenbrainzRoutes.mts";
import { AppError } from "./errors.mts";

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