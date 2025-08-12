import Fastify from "fastify";
import dotenv from "dotenv";

dotenv.config();

const fastify = Fastify({ logger: true });

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

if (!client_id || !client_secret) {
    console.error("Error: missing client_id and client_secret in .env fle");
    process.exit(1);
}

let spotifyToken = "";

fastify.get("/", async (request, reply) => {
    return { hello: "world" };
});

fastify.get("/get-spotify-access-token", async (request, reply) => {
    const params = new URLSearchParams();
    params.append("grant_type", "client_credentials");
    params.append("client_id", client_id);
    params.append("client_secret", client_secret);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",

        },
        body: params.toString()
    });

    const data = await response.json();
    spotifyToken = data.access_token;
    console.log(data.access_token);
});

fastify.get("/get-artist", async (request, reply) => {
    const response = await fetch("https://api.spotify.com/v1/artists/4Z8W4fKeB5YxbusRsdQVPb", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${spotifyToken}`,
        },
    });

    const data = await response.json();
    console.log(data)
});

//spotify url is deprecated
fastify.get("/get-related-artists", async (request, reply) => {
    const artistId = "4Z8W4fKeB5YxbusRsdQVPb";

    const url = `https://api.spotify.com/v1/artists/${artistId}/related-artists`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${spotifyToken}`,
        },
    });

    const data = await response.json();
    console.log(data);
});

fastify.get("/search-artist", async (request, reply) => {
    const artist = "z.e";
    const encodedQuery = encodeURIComponent(artist);
    const url = `https://api.spotify.com/v1/search?q=${encodedQuery}&type=artist&market=US`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${spotifyToken}`,
            "Content-Type": "application/json"
        },
    });

    const data = await response.json();
    console.log(data.artists.items);
});


fastify.get("/listenbrainz/search-artist", async (request, reply) => {
    const artist = "Kendrick lamar";
    const encodedQuery = encodeURIComponent(artist);
    const url = `https://musicbrainz.org/ws/2/artist?query=${encodedQuery}&fmt=json`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.1 ( kullander.sebastian@gmail.com )"
        }
    });

    const data = await response.json();
    console.log(data);
});

fastify.get("/listenbrainz/search-related-artists", async(request, reply) => {
    const artistId = "381086ea-f511-4aba-bdf9-71c753dc5077";
    const url = `https://labs.api.listenbrainz.org/similar-artists/json?artist_mbids=${artistId}&algorithm=session_based_days_7500_session_300_contribution_5_threshold_10_limit_100_filter_True_skip_30`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "User-Agent": "new-music-discovery-by-nodes/0.1 ( kullander.sebastian@gmail.com )"
        }
    });

    //console.log(response.status, await response.text());
    const data = await response.json();
    console.log("HOW MANY", data.length);
})


async function start() {
    try {
        await fastify.listen({ port: 3001 });
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
}

start();