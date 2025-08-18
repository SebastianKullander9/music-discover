import neo4j from "neo4j-driver";
import { driver } from "./driver.mts";

export async function getSimilarArtistsGraph(artistName: string) {
    const session = driver.session();

    try {
        const result = await session.run(
            `
            MATCH (a:Artist {name: $artistName})-[r:SIMILAR_TO|AUDIO_SIMILAR]->(b:Artist)
            WITH a, b, r
            ORDER BY r.similarity DESC
            LIMIT 50
            RETURN
                collect(DISTINCT {id: a.mbid, name: a.name}) + collect(DISTINCT {id: b.mbid, name: b.name}) AS nodes,
                collect(DISTINCT {source: a.mbid, target: b.mbid, similarity: r.similarity}) AS edges
            `,
            { artistName }
        );

        const record = result.records[0];
        return {
            nodes: record.get("nodes"),
            edges: record.get("edges"),
        };
    } finally {
        await session.close();
    }
}

(async () => {
    const graph = await getSimilarArtistsGraph("Kendrick Lamar");
    console.log(graph);
})();