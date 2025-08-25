import * as query from "../neo4j/queries.mts";

export async function getSimilarArtistsGraph(name: string, mbid: string) {
    try {
        const graphData = await query.getSimilarArtistsGraph(name, mbid);

        if (!graphData || !graphData.nodes?.length) {
            throw new Error(`No graph data found for artist: ${name} with mbid: ${mbid}`);
        }

        return graphData;
    } catch (err) {
        console.error("Neo4j query failed:", err);
        throw new Error("Could not fetch data from Neo4j");
    }
}

export async function getAudioSimilarArtistsGraph(name: string, mbid: string) {
    try {
        const graphData = await query.getAudioSimilarArtistsGraph(mbid);

        if (!graphData || !graphData.nodes?.length) {
            throw new Error(`No graph data found for artist: ${name} with mbid: ${mbid}`);
        }

        return graphData;
    } catch (err) {
        console.error("Neo4j query failed:", err);
        throw new Error("Could not fetch data from Neo4j");
    }
}

export async function getTagSharedArtistsGraph(name: string, mbid: string) {
    try {
        const graphData = await query.getTagSharedArtistsGraph(mbid);

        if (!graphData || !graphData.nodes?.length) {
            throw new Error(`No graph data found for artist: ${name} with mbid: ${mbid}`);
        }

        return graphData;
    } catch (err) {
        console.error("Neo4j query failed:", err);
        throw new Error("Could not fetch data from Neo4j");
    }
}