import * as query from "../neo4j/queries.mts";

export async function getSimilarArtistsGraph(name: string) {
    try {
        const graphData = await query.getSimilarArtistsGraph(name);

        if (!graphData || !graphData.nodes?.length) {
            throw new Error(`No graph data found for artist: ${name}`);
        }

        return graphData;
    } catch (err) {
        console.error("Neo4j query failed:", err);
        throw new Error("Could not fetch data from Neo4j");
    }
}