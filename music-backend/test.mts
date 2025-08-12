import { testConnection, createArtistIfNotExists, createSongIfNotExists } from "./neo4j.mts";

async function main() {
    await testConnection();
    const artist = await createArtistIfNotExists("Lauryn hill", "Rnb");
    const song = await createSongIfNotExists("X-factor", "Lauryn hill", 2017);
    console.log("Created artist:", artist);
    console.log("Created song:", song);
}

main();