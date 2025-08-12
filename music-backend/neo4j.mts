import dotenv from "dotenv";
dotenv.config();
import neo4j from "neo4j-driver";

const neo4j_uri = process.env.NEO4J_URI;
const neo4j_username = process.env.NEO4J_USERNAME;
const neu4j_password = process.env.NEO4J_PASSWORD;

if (!neo4j_uri || !neo4j_username || !neu4j_password) {
    console.error("Error: missing neo4j credentials in .env file");
    process.exit(1);
}

const driver = neo4j.driver(
    neo4j_uri,
    neo4j.auth.basic(neo4j_username, neu4j_password),
);

async function testConnection() {
    const session = driver.session();

    try {
        const result = await session.run("RETURN 'Hello Neu4j' as message");
        console.log(result.records[0].get("message"));
    } finally {
        await session.close();
    }
}

async function createArtistIfNotExists(name: string, genre: string) {
    const session = driver.session();

    try {
        const result = await session.run(
            "MERGE (a:Artist {name: $name}) ON CREATE SET a.genre = $genre RETURN a",
            { name, genre }
        );
        
        return result.records[0].get("a").properties;
    } finally {
        await session.close();
    }
}

async function createSongIfNotExists(title: string, artist: string, year?:number) {
    const session = driver.session();

    try {
       const result = await session.run(
            `MERGE (a:Artist {name: $artist})
            MERGE (s:Song {title: $title}) 
            ON CREATE SET s.year = $year
            MERGE (a)-[:PERFORMED]->(s)
            RETURN s, a`,
            { title, artist, year }
        );

        return {
            song: result.records[0].get("s").properties,
            artist: result.records[0].get("a").properties
        };
    } finally {
        await session.close();
    }
}

export { testConnection, createArtistIfNotExists, createSongIfNotExists, driver };
