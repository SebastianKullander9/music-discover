import neo4j from "neo4j-driver";
import { ArtistDataType } from "./dataTypes.mts";
import { SimilarityRelationship } from "../services/artistService.mts";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const neo4jUri = process.env.NEO4J_URI;
const neo4jUsername = process.env.NEO4J_USERNAME;
const neo4jPassword = process.env.NEO4J_PASSWORD;

if (!neo4jUri || !neo4jUsername || !neo4jPassword) {
    console.error("Error: missing Neo4j credentials in .env file");
    process.exit(1);
}

export const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(neo4jUsername, neo4jPassword)
);

export async function importArtistFull(
    artistDataArray: ArtistDataType[],
    similarityRelationships: SimilarityRelationship[] = []
) {
    const session = driver.session();

    try {
        await session.run(
            `
            UNWIND $artists AS artist
            MERGE (a:Artist {mbid: artist.mbid})
            SET a.name = artist.name,
                a.spotifyPopularity = artist.spotifyPopularity,
                a.spotifyFollowers = artist.spotifyFollowers,
                a.spotifyGenres = artist.spotifyGenres,
                a.topLastfmGenres = artist.topLastfmGenres,
                a.audioTempo = artist.audioTempo,
                a.audioValence = artist.audioValence,
                a.audioDanceability = artist.audioDanceability,
                a.audioAcousticness = artist.audioAcousticness
            `,
            { artists: artistDataArray }
        );

        if (similarityRelationships.length > 0) {
            await session.run(
                `
                UNWIND $rels AS r
                MATCH (a:Artist {mbid: r.mainId})
                MATCH (t:Artist {mbid: r.targetId})
                MERGE (a)-[rel:SIMILAR_TO {source: r.source, relationshipType: r.relationshipType}]->(t)
                SET rel.similarity = r.similarity
                `,
                { rels: similarityRelationships }
            );
        }
    } finally {
        await session.close();
    }

    return { added: artistDataArray.map(a => a.name) };
}

export async function computeAudioSimilarity(newArtistMbids: string[]) {
    const session = driver.session();

    try {
        await session.run(
            `
            UNWIND $newMbids AS newMbid
            MATCH (new:Artist {mbid: newMbid})
            WHERE new.audioDanceability IS NOT NULL
              AND new.audioValence IS NOT NULL
              AND new.audioAcousticness IS NOT NULL
            MATCH (existing:Artist)
            WHERE existing.audioDanceability IS NOT NULL
              AND existing.audioValence IS NOT NULL
              AND existing.audioAcousticness IS NOT NULL
              AND new <> existing
            WITH new, existing,
                 sqrt(
                    (new.audioDanceability - existing.audioDanceability)^2 +
                    (new.audioValence - existing.audioValence)^2 +
                    (new.audioAcousticness - existing.audioAcousticness)^2
                 ) AS distance
            WITH new, existing, 1 / (1 + distance) AS similarity
            WHERE similarity > 0.5
            MERGE (new)-[r:AUDIO_SIMILAR]-(existing)
            SET r.similarity = similarity
            `,
            { newMbids: newArtistMbids }
        );
    } finally {
        await session.close();
    }
}