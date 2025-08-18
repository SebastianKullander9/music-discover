import neo4j from "neo4j-driver";
import { ArtistDataType } from "./dataTypes.mts"
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const neo4jUri = process.env.NEO4J_URI;
const neo4jUsername = process.env.NEO4J_USERNAME;
const neo4jPassword = process.env.NEO4J_PASSWORD;

if (!neo4jUri || !neo4jUsername || !neo4jPassword) {
    console.error("Error: missing neo4j credentials in .env file");
    process.exit(1);
}

export const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(neo4jUsername, neo4jPassword)
);

export async function importArtist(artistData: ArtistDataType) {
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

         for (const relation of artistData.similarityRelationships) {
            const targetMbid = relation.targetArtistMbid || `NAME::${relation.targetArtistName}`;
            await session.run(
                `
                MATCH (t:Artist {mbid: $targetId})
                MATCH (a:Artist {mbid: $mainId})
                MERGE (a)-[r:SIMILAR_TO {source: $source}]->(t)
                SET r.similarity = $similarity
                `,
                {
                    targetId: targetMbid,
                    mainId: artistData.mbid,
                    similarity: relation.similarity,
                    source: relation.source,
                }
            );
         }
    } finally {
        await session.close();

        return {"added": artistData.name}
    }
}