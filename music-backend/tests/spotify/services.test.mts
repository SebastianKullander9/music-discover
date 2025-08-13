import { describe, it, expect, vi, beforeEach } from "vitest";
import spotifyRoutes from "../../routes/spotifyRoutes.mts";

vi.stubGlobal("fetch", vi.fn());

describe("Spotify Service", async () => {
    const { getSpotifyAccessToken } = await import("../../services/spotifyService.mts");

    const mockAccessTokenResponse = {
        access_token: "token",
        expires_in: 3600,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        vi.stubGlobal("fetch", vi.fn());

        (spotifyRoutes as any).spotifyToken = "";
        (spotifyRoutes as any).tokenExpiresAt = 0;
    });

    it("returns an access token", async () => {
        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ access_token: "fake-token", expires_in: 3600 }),
        });

        const token = await getSpotifyAccessToken();
        expect(token).toBe("fake-token");
    });

    it("returns artist by id", async () => {
        const { getArtistById } = await import("../../services/spotifyService.mts");
        const mockArtist = { id: "123", name: "Mock Artist" };

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockAccessTokenResponse,
        });

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockArtist,
        });

        const artist = await getArtistById("123");
        expect(artist).toEqual(mockArtist);     
    });

    it("returns artists by name", async () => {
        const { getArtistByName } = await import("../../services/spotifyService.mts");
        const mockArtist = { id: "123", name: "Mock artist"};

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockAccessTokenResponse,
        });

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                artists: {
                    items: [mockArtist]
                }
            })
        });

        const artist = await getArtistByName("Mock artist");
        expect(artist).toEqual(mockArtist);
    })

    it("throws an error when spotify API fails", async () => {
        const spotifyService = await import("../../services/spotifyService.mts");

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockAccessTokenResponse,
        });

        (fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: "Internal Server Error",
            json: async () => ({}),
        });

        await expect(spotifyService.getArtistById("123")).rejects.toThrow("Spotify API request failed: 500 Internal Server Error");
    });
});