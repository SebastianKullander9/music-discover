import * as query from "../neo4j/queries.mts";

export async function getSimilarArtistsGraph(name: string) {
    const graphData = query.getSimilarArtistsGraph(name);

    if (!graphData) {
        throw new Error("Could not get data from neo4j");
    }

    return graphData;
}