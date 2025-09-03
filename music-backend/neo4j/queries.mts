import neo4j from "neo4j-driver";
import { driver } from "./driver.mts";

export async function getSimilarArtistsGraph(mainArtist: string, mbid: string) {
    const session = driver.session();
    const nodes: { id: string; label: string }[] = [];
    const edges: { from: string; to: string; similarity: number }[] = [];

    try {
        const result = await session.run(
            `
            MATCH (a:Artist {mbid: $mbid})-[r:SIMILAR_TO]-(similar:Artist)
            WHERE similar.name IS NOT NULL
            RETURN DISTINCT similar.name AS name, similar.mbid AS mbid, r.similarity AS similarity
            ORDER BY similarity DESC
            LIMIT 50
            `,
            { mbid }
        );

        // Use mbid as unique identifier to preserve positions
        nodes.push({ id: mbid, label: mainArtist });

        result.records.forEach(record => {
            const name = record.get("name");
            const similarMbid = record.get("mbid");
            const similarity = record.get("similarity");

            if (!name || !similarMbid) return;

            // Only add node if it doesn't already exist
            if (!nodes.some(n => n.id === similarMbid)) {
                nodes.push({ id: similarMbid, label: name });
            }

            edges.push({ from: mbid, to: similarMbid, similarity });
        });

        return { nodes, edges };
    } finally {
        await session.close();
    }
}

export async function getAudioSimilarArtistsGraph(artistName: string, mbid: string) {
    const session = driver.session();
    const nodes: { id: string; label: string }[] = [];
    const edges: { from: string; to: string; similarity: number }[] = [];

    try {
        const result = await session.run(
            `
            MATCH (a:Artist {mbid: $mbid})-[r:AUDIO_SIMILAR]-(similar:Artist)
            WHERE similar.name IS NOT NULL
            RETURN DISTINCT similar.name AS name, similar.mbid AS mbid, r.similarity AS similarity
            ORDER BY r.similarity DESC
            LIMIT 50
            `,
            { mbid }
        );

        nodes.push({ id: mbid, label: artistName });

        result.records.forEach(record => {
            const name = record.get("name");
            const similarMbid = record.get("mbid");
            const similarity = record.get("similarity");

            if (!name || !similarMbid) return;

            if (!nodes.some(n => n.id === similarMbid)) {
                nodes.push({ id: similarMbid, label: name });
            }

            edges.push({ from: mbid, to: similarMbid, similarity });
        });

        return { nodes, edges };
    } finally {
        await session.close();
    }
}

export async function getTagSharedArtistsGraph(artistName: string, mbid: string) {
    const session = driver.session();
    const nodes: { id: string; label: string }[] = [];
    const edges: { from: string; to: string; similarity: number }[] = [];

    try {
        const result = await session.run(
        `
        MATCH (a:Artist {mbid: $mbid})
        MATCH (similar:Artist)
        WHERE similar.mbid <> $mbid
        WITH a, similar,
             [tag IN a.topLastfmGenres | toLower(tag)] AS aTags,
             [tag IN similar.topLastfmGenres | toLower(tag)] AS sTags
        WITH similar,
             size([tag IN aTags WHERE tag IN sTags]) AS sharedCount,
             size(aTags + sTags) - size([tag IN aTags WHERE tag IN sTags]) AS totalCount
        RETURN similar.name AS name,
               (CASE WHEN totalCount = 0 THEN 0 ELSE sharedCount * 1.0 / totalCount END) AS similarity
        ORDER BY similarity DESC
        LIMIT 50
        `,
        { mbid }
        );

        nodes.push({ id: mbid, label: artistName });

        result.records.forEach(record => {
            const name = record.get("name");
            const similarity = record.get("similarity");

            if (!name) return;

            if (!nodes.some(n => n.id === name)) {
                nodes.push({ id: name, label: name });
            }

            edges.push({ from: mbid, to: name, similarity });
        });

        return { nodes, edges };
    } finally {
        await session.close();
    }
}