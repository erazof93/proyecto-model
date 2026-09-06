/**
 * @jest-environment node
 */

jest.mock("@/lib/auth/session", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/db/admin-queries", () => ({ getAdminStats: jest.fn() }));

import { GET } from "../route";
import { getSession } from "@/lib/auth/session";
import { getAdminStats } from "@/lib/db/admin-queries";

const mockGetSession = getSession as jest.Mock;
const mockGetAdminStats = getAdminStats as jest.Mock;

describe("GET /api/admin/stats", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 for a non-admin session", async () => {
    mockGetSession.mockResolvedValue({ role: "customer" });
    const response = await GET();
    expect(response.status).toBe(401);
    expect(mockGetAdminStats).not.toHaveBeenCalled();
  });

  it("returns 401 when there is no session at all", async () => {
    mockGetSession.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns real stats for an admin session", async () => {
    mockGetSession.mockResolvedValue({ role: "admin" });
    mockGetAdminStats.mockResolvedValue({
      totalModelos: 8,
      verifiedModelos: 6,
      activeFeatured: 2,
      totalReviews: 2,
      avgRating: "4.5",
    });

    const response = await GET();
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.stats.totalModelos).toEqual(expect.any(Number));
    expect(data.stats.verifiedModelos).toEqual(expect.any(Number));
  });
});
