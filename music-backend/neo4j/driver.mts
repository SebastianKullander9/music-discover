import neo4j from "neo4j-driver";
import { ArtistDataType } from "./dataTypes.mts";
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

export async function importArtistFull(artistData: ArtistDataType) {
    const session = driver.session();

    try {
        await session.run(
            `
            MERGE (a:Artist {mbid: $mbid})
            SET a.name = $name,
                    a.spotifyPopularity = $spotifyPopularity,
                    a.spotifyFollowers = $spotifyFollowers,
                    a.spotifyGenres = $spotifyGenres,
                    a.topLastfmGenres = $topLastfmGenres,
                    a.audioTempo = $audioTempo,
                    a.audioValence = $audioValence,
                    a.audioDanceability = $audioDanceability,
                    a.audioAcousticness = $audioAcousticness
            `,
            {
                mbid: artistData.mbid,
                name: artistData.name,
                spotifyPopularity: artistData.spotifyPopularity,
                spotifyFollowers: artistData.spotifyFollowers,
                spotifyGenres: artistData.spotifyGenres,
                topLastfmGenres: artistData.topLastfmGenres,
                audioTempo: artistData.audioFeatures.tempo,
                audioValence: artistData.audioFeatures.valence,
                audioDanceability: artistData.audioFeatures.danceability,
                audioAcousticness: artistData.audioFeatures.acousticness,
            }
        );

        for (const tag of artistData.topListenbrainzTags || []) {
            await session.run(
                `
                MERGE (t:Tag {name: $tagName})
                MERGE (a:Artist {mbid: $mbid})-[:TAGGED_WITH {
                        rawWeight: $rawWeight,
                        normalizedWeight: $normalizedWeight,
                        confidence: $confidence
                }]->(t)
                `,
                {
                    tagName: tag.name,
                    mbid: artistData.mbid,
                    rawWeight: tag.rawWeight,
                    normalizedWeight: tag.normalizedWeight,
                    confidence: tag.confidence,
                }
            );
        }

        for (const relation of artistData.similarityRelationships || []) {
            const targetMbid = relation.targetArtistMbid || `NAME::${relation.targetArtistName}`;
            await session.run(
                `
                MATCH (a:Artist {mbid: $mainId})
                MATCH (t:Artist {mbid: $targetId})
                MERGE (a)-[r:SIMILAR_TO {source: $source, relationshipType: $relationshipType}]->(t)
                SET r.similarity = $similarity
                `,
                {
                    targetId: targetMbid,
                    mainId: artistData.mbid,
                    similarity: relation.similarity,
                    source: relation.source,
                    relationshipType: relation.relationshipType,
                }
            );
        }
    } finally {
        await session.close();
    }

    return { added: artistData.name };
}

export async function computeAudioSimilarity() {
    const session = driver.session();

    try {
        await session.run(`
            MATCH (a:Artist)
            WHERE a.audioDanceability IS NOT NULL 
              AND a.audioValence IS NOT NULL 
              AND a.audioAcousticness IS NOT NULL 
            WITH collect(a) AS artists
            UNWIND range(0, size(artists)-2) AS i
            UNWIND range(i+1, size(artists)-1) AS j
            WITH artists[i] AS a, artists[j] AS b
            WITH a, b,
                 sqrt(
                    (a.audioDanceability - b.audioDanceability)^2 +
                    (a.audioValence - b.audioValence)^2 +
                    (a.audioAcousticness - b.audioAcousticness)^2
                 ) AS distance
            WITH a, b, 1 / (1 + distance) AS similarity
            WHERE similarity > 0.5
            MERGE (a)-[r:AUDIO_SIMILAR]-(b)
            SET r.similarity = similarity
        `);
    } finally {
        await session.close();
    }
}