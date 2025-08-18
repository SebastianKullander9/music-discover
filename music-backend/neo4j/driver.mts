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

        return { added: artistData.name}
    }
}

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
                MERGE (a:Artist {mbid: $mbid})-[:TAGGED_WITH {rawWeight: $rawWeight, normalizedWeight: $normalizedWeight, confidence: $confidence}]->(t)
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
        return { added: artistData.name };
    }
}

export async function computeAudioSimilarity() {
    const session = driver.session();

    try {
        const artistsResult = await session.run(`
            MATCH (a:Artist)
            WHERE a.audioDanceability IS NOT NULL 
            AND a.audioValence IS NOT NULL
            RETURN a.mbid AS mbid, 
                a.audioDanceability AS danceability,
                a.audioValence AS valence, 
                a.audioAcousticness AS acousticness,
                a.audioTempo AS tempo
        `);

        const artists = artistsResult.records.map(r => ({
            mbid: r.get("mbid"),
            features: [
                r.get("danceability"),
                r.get("valence"),
                r.get("acousticness"),
                r.get("tempo")
            ]
        }));


        for (let i = 0; i < artists.length; i++) {
            for (let j = i + 1; j < artists.length; j++) {
                const a = artists[i];
                const b = artists[j];

                // Euclidean distance
                const distance = Math.sqrt(
                    a.features.reduce((sum, val, idx) => sum + Math.pow(val - b.features[idx], 2), 0)
                );

                const similarity = 1 / (1 + distance);

                // Create AUDIO_SIMILAR relationship if similarity > threshold
                if (similarity > 0.5) {
                    await session.run(
                        `
                        MATCH (a:Artist {mbid: $mbidA})
                        MATCH (b:Artist {mbid: $mbidB})
                        MERGE (a)-[r:AUDIO_SIMILAR]->(b)
                        SET r.similarity = $similarity
                        `,
                        { mbidA: a.mbid, mbidB: b.mbid, similarity }
                    );
                }
            }
        }
    } finally {
        await session.close();
    }
}