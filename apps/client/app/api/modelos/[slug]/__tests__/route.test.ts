/**
 * @jest-environment node
 */

jest.mock("@/lib/db/queries", () => ({
  getModeloBySlug: jest.fn(),
  getReviews: jest.fn(),
}));

import { GET } from "../route";
import { getModeloBySlug, getReviews } from "@/lib/db/queries";

const mockGetModeloBySlug = getModeloBySlug as jest.Mock;
const mockGetReviews = getReviews as jest.Mock;

function makeParams(slug: string) {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /api/modelos/[slug]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the model and its reviews for a valid slug (no `photos` field — that's not part of this route)", async () => {
    mockGetModeloBySlug.mockResolvedValue({ id: "m1", slug: "sofia-lima", name: "Sofía" });
    mockGetReviews.mockResolvedValue([{ id: "r1", rating: 5 }]);

    const response = await GET(new Request("http://localhost:3000/api/modelos/sofia-lima"), makeParams("sofia-lima"));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.model.slug).toBe("sofia-lima");
    expect(Array.isArray(data.reviews)).toBe(true);
    expect(data.photos).toBeUndefined();
    expect(mockGetReviews).toHaveBeenCalledWith("m1");
  });

  it("returns 404 for a non-existent slug", async () => {
    mockGetModeloBySlug.mockResolvedValue(null);

    const response = await GET(
      new Request("http://localhost:3000/api/modelos/no-existe"),
      makeParams("no-existe"),
    );
    expect(response.status).toBe(404);
    expect(mockGetReviews).not.toHaveBeenCalled();
  });
});
