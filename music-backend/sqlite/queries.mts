import { db } from "./db.mts";

type SearchSuggestionArtist = {
    name: string;
    mbid: string;
}

export const getArtistsByName = (search: string) => {
    const query = search.trim();
    if (!query) return [];

    const stmt = db.prepare("SELECT name, mbid FROM artists WHERE name LIKE ? COLLATE NOCASE");

    return stmt.all(`%${query}%`);
};

export const addArtistIfNotExists = (name: string, mbid: string) => {
    const stmt = db.prepare("INSERT OR IGNORE INTO artists (name, mbid) VALUES (?, ?)");

    return stmt.run(name, mbid);
}