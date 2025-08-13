import Fastify from "fastify";
import listenbrainzRoutes from "../../routes/listenbrainzRoutes.mts";
import * as listenbrainzService from "../../services/listenbrainzService.mts";
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Listenbrainz routes", () => {
    let app: ReturnType<typeof Fastify>

    beforeEach(() => {
        app = Fastify();
        vi.restoreAllMocks();
        app.register(listenbrainzRoutes);
    });
    
    it("GET /get-artist-by-name returns artists data", async () => {
        const mockArtist = { 
            name: "Mock artist", 
            id: "artist123", 
            genre: "rock" 
        };
        
        vi.spyOn(listenbrainzService, "searchArtistByName").mockResolvedValueOnce(mockArtist);

        const response = await app.inject({
            method: "GET",
            url: "/get-artist-by-name?name=mock artist"
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual({
            success: true,
            data: {
                items: [mockArtist]
            }
        })
    });

    it("GET /get-artists-related-artists returns artists data", async () => {
        const mockRelatedArtists = [
            { id: "123", name: "Related Artist 1" },
            { id: "456", name: "Related Artist 2" }
        ];
        vi.spyOn(listenbrainzService, "getArtistsRelatedArtists").mockResolvedValueOnce(mockRelatedArtists);

        const response = await app.inject({
            method: "GET",
            url: "/get-artists-related-artists?id=123"
        });

        expect(response.statusCode).toBe(200);
        const body = JSON.parse(response.body);
        expect(body).toEqual({
            success: true,
            data: {
                items: mockRelatedArtists
            }
        })
    });

});
