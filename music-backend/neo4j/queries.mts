import neo4j from "neo4j-driver";
import { driver } from "./driver.mts";

export async function getSimilarArtistsGraph(artistName: string) {
    const session = driver.session();
    const nodes: { id: string; label: string }[] = [];
    const edges: { from: string; to: string; similarity: number }[] = [];

    try {
        const result = await session.run(
            `
            MATCH (a:Artist {name: $artistName})-[r:SIMILAR_TO]-(similar:Artist)
            WHERE similar.name IS NOT NULL
            RETURN DISTINCT similar.name AS name, r.similarity AS similarity
            ORDER BY similarity DESC
            LIMIT 50
            `,
            { artistName }
        );

        nodes.push({ id: artistName, label: artistName });

        result.records.forEach(record => {
            const name = record.get("name");
            const similarity = record.get("similarity");

            if (!name) return;

            if (!nodes.some(n => n.id === name)) {
                nodes.push({ id: name, label: name });
            }

            edges.push({ from: artistName, to: name, similarity });
        });

        return { nodes, edges };
    } finally {
        await session.close();
    }
}

export async function getAudioSimilarArtistsGraph(artistName: string) {
    const session = driver.session();
    const nodes: { id: string; label: string }[] = [];
    const edges: { from: string; to: string; similarity: number }[] = [];

    try {
        const result = await session.run(
            `
            MATCH (a:Artist {name: $artistName})-[r:AUDIO_SIMILAR]-(similar:Artist)
            WHERE similar.name IS NOT NULL
            RETURN DISTINCT similar.name AS name, r.similarity AS similarity
            ORDER BY r.similarity DESC
            LIMIT 50
            `,
            { artistName }
        );

        nodes.push({ id: artistName, label: artistName });

        result.records.forEach(record => {
            const name = record.get("name");
            const similarity = record.get("similarity");

            if (!name) return;

            if (!nodes.some(n => n.id === name)) {
                nodes.push({ id: name, label: name });
            }

            edges.push({ from: artistName, to: name, similarity });
        });

        return { nodes, edges };
    } finally {
        await session.close();
    }
}

export async function getTagSharedArtistsGraph(artistName: string) {
    const session = driver.session();
    const nodes: { id: string; label: string }[] = [];
    const edges: { from: string; to: string; similarity: number }[] = [];

    try {
        const result = await session.run(
        `
        MATCH (a:Artist {name: $artistName})- [r1:TAGGED_WITH] -> (t:Tag) <- [r2:TAGGED_WITH] - (similar:Artist)
        WHERE similar.name IS NOT NULL AND similar.name <> $artistName
        WITH similar, COLLECT(r1.normalizedWeight * r2.normalizedWeight) AS products
        RETURN similar.name AS name, REDUCE(s=0.0, x IN products | s + x)/SIZE(products) AS similarity
        ORDER BY similarity DESC
        LIMIT 50
        `,
        { artistName }
        );


        nodes.push({ id: artistName, label: artistName });


        result.records.forEach(record => {
            const name = record.get("name");
            const similarity = record.get("similarity");

            if (!name) return;

            if (!nodes.some(n => n.id === name)) {
                nodes.push({ id: name, label: name });
            }

            edges.push({ from: artistName, to: name, similarity });
        });

        if (edges.length > 0) {
            const sims = edges.map(e => e.similarity);
            const minSim = Math.min(...sims);
            const maxSim = Math.max(...sims);

            const scale = (sim: number) => {
                if (maxSim === minSim) return 0.75;
                return 0.5 + ((sim - minSim) / (maxSim - minSim)) * 0.5;
            };

            edges.forEach(edge => {
                edge.similarity = scale(edge.similarity);
            });
        }

        return { nodes, edges };
    } finally {
        await session.close();
    }
}