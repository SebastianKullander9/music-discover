import Fastify from "fastify";
import spotifyRoutes from "../../routes/spotifyRoutes.mts";
import * as spotifyService from "../../services/spotifyService.mts";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Spotify routes", () => {
    let app: ReturnType<typeof Fastify>

    beforeEach(() => {
        app = Fastify();
        vi.restoreAllMocks();
        app.register(spotifyRoutes);
    });

    //correct path tests
    it("GET /get-artist-by-id returns artist data", async () => {
        vi.spyOn(spotifyService, "getArtistById").mockResolvedValueOnce({ id: "123", name: "Mock artist" });

        const response = await app.inject({
            method: "GET",
            url: "/get-artist-by-id?id=123",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual({
            success: true,
            data: { id: "123", name: "Mock artist" },
        });
    });

    it("GET /get-artist-by-name returns artist data", async () => {
        vi.spyOn(spotifyService, "getArtistByName").mockResolvedValueOnce({ id: "123", name: "Mock artist" });

        const response = await app.inject({
            method: "GET",
            url: "/get-artist-by-name?name=mock artist",
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual({
            success: true,
            data: { id: "123", name: "Mock artist" }
        });
    })

    it("GET /get-access-token returns token", async () => {
        vi.spyOn(spotifyService, "getSpotifyAccessToken").mockResolvedValueOnce("token");

        const response = await app.inject({
            method: "GET",
            url: "/get-access-token"
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual({ success: true, data: { access_token: "token" } });
    });
})