import neo4j from "neo4j-driver";
import { ArtistDataType } from "./dataTypes.mts"
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });

//just for test
import artistData from '../../parsedartistdata.json' with { type: 'json' };

const neo4jUri = process.env.NEO4J_URI;
const neo4jUsername = process.env.NEO4J_USERNAME;
const neo4jPassword = process.env.NEO4J_PASSWORD;

if (!neo4jUri || !neo4jUsername || !neo4jPassword) {
    console.error("Error: missing neo4j credentials in .env file");
    process.exit(1);
}

const driver = neo4j.driver(
    neo4jUri,
    neo4j.auth.basic(neo4jUsername, neo4jPassword)
);

async function importArtist(artistData: ArtistDataType) {
    const session = driver.session();
    const { artist, similarityRelationships } = artistData;

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
                mbid: artist.mbid,
                name: artist.name,
                spotifyPopularity: artist.spotifyPopularity,
                spotifyFollowers: artist.spotifyFollowers,
                spotifyGenres: artist.spotifyGenres,
                topLastfmGenres: artist.topLastfmGenres,
                audioTempo: artist.audioFeatures.tempo,
                audioValence: artist.audioFeatures.valence,
                audioDanceability: artist.audioFeatures.danceability,
                audioAcousticness: artist.audioFeatures.acousticness,
            }
         );

         for (const relation of similarityRelationships) {
            const targetMbid = relation.targetArtistMbid || `NAME::${relation.targetArtistName}`;
            await session.run(
                `
                MATCH (t:Artist {mbid: $targetId})
                MATCH (a:Artist {mbid: $mainId})
                MERGE (a)-[r:SIMILAR_TO {source: $source}]->(t)
                SET r.similarity = $similarity
                `,
                {
                    targetId: relation.targetArtistMbid ? relation.targetArtistMbid : null,
                    mainId: artist.mbid,
                    similarity: relation.similarity,
                    source: relation.source,
                }
            );
         }
    } finally {
        await session.close();
    }
}

async function main(artistData: ArtistDataType) {
    await importArtist(artistData);
    await driver.close();
}

main(artistData);