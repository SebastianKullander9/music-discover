import { describe, it, expect, vi, beforeEach } from "vitest";
import * as listenbrainzController from "../../controllers/listenbrainzController.mts";
import * as listenbrainzService from "../../services/listenbrainzService.mts";
import { mock } from "node:test";

describe("listenbrainz controller", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("getArtistByName returns formatted resposne", async () => {
        const mockArtist = { id: "123", name: "Mock artist" };
        vi.spyOn(listenbrainzService, "searchArtistByName").mockResolvedValueOnce(mockArtist);

        const req = { query: { id: "123", } } as any;
        const reply = {} as any;

        const result = await listenbrainzController.getArtistByName(req, reply);
        expect(result).toEqual({ success: true, data: { items: [mockArtist] } });
    });

    it("getArtistsRelatedArtists returns formatted resposne", async () => {
        const mockArtist = { id: "123", name: "Mock artist" };
        vi.spyOn(listenbrainzService, "getArtistsRelatedArtists").mockResolvedValueOnce(mockArtist);

        const req = { query: { id: "123", } } as any;
        const reply = {} as any;

        const result = await listenbrainzController.getArtistsRelatedArtists(req, reply);
        expect(result).toEqual({ success: true, data: { items: [mockArtist] } });
    });
})