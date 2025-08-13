import { describe, it, expect, vi, beforeEach } from "vitest";
import * as spotifyController from "../../controllers/spotifyController.mts";
import * as spotifyService from "../../services/spotifyService.mts";

describe("Spotify Controller", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("getSpotifyAccessToken returns formatted response", async () => {
        vi.spyOn(spotifyService, "getSpotifyAccessToken").mockResolvedValueOnce("token");

        const req = {} as any;
        const reply = {} as any;

        const result = await spotifyController.getSpotifyAccessToken(req, reply);
        expect(result).toEqual({ success: true, data: { access_token: "token" } });
    });

    it("getArtistById returns formatted response", async () => {
        const mockArtist = { id: "123", name: "Mock artist" };
        vi.spyOn(spotifyService, "getArtistById").mockResolvedValueOnce(mockArtist);

        const req = { query: { id: "123", } } as any;
        const reply = {} as any;

        const result = await spotifyController.getArtistById(req, reply);
        expect(result).toEqual({ success: true, data: mockArtist });
    });

    it("getArtistByName returns formatted response", async () => {
        const mockArtist = { id: "123", name: "Mock artist" };
        vi.spyOn(spotifyService, "getArtistByName").mockResolvedValueOnce(mockArtist);

        const req = { query: { name: "mock artist", } } as any;
        const reply = {} as any;

        const result = await spotifyController.getArtistByName(req, reply);
        expect(result).toEqual({ success: true, data: mockArtist });
    })
})