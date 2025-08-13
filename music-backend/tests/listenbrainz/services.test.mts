import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListenbrainzAPIError } from "../../errors.mts";

vi.stubGlobal("fetch", vi.fn());

describe("Listenbrainz service", async () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns artist by id", async () => {
        const { searchArtistByName } = await import("../../services/listenbrainzService.mts");
        const mockArtist = { id: "123", name: "Mock Artist" };

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => mockArtist,
        });

        const artist = await searchArtistByName("Mock Artist");
        expect(artist).toEqual(mockArtist);     
    });


    it("returns artists related to artist by id", async () => {
        const { getArtistsRelatedArtists } = await import("../../services/listenbrainzService.mts");
        const mockArtist = { id: "123", name: "Mock artist"};

        (fetch as any).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                artists: {
                    items: [mockArtist]
                }
            })
        });

        const data = await getArtistsRelatedArtists("123");
        expect(data).toEqual({
            artists: { items: [mockArtist]}
        });
    });

    it("throws ListenbrainzAPIError when search fails", async () => {
        const { searchArtistByName } = await import("../../services/listenbrainzService.mts");

        (fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 500,
            statusText: "Server Error",
        });

        await expect(searchArtistByName("Mock Artist")).rejects.toBeInstanceOf(ListenbrainzAPIError);
    });

    it("throws ListenbrainzAPIError when related artists request fails", async () => {
        const { getArtistsRelatedArtists } = await import("../../services/listenbrainzService.mts");

        (fetch as any).mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: "Not Found",
        });

        await expect(getArtistsRelatedArtists("123")).rejects.toBeInstanceOf(ListenbrainzAPIError);
    });
})
