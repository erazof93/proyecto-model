/**
 * @jest-environment node
 */

jest.mock("@/lib/auth/session", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/db/admin-queries", () => ({ getBannerRequests: jest.fn() }));

import { GET } from "../route";
import { getSession } from "@/lib/auth/session";
import { getBannerRequests } from "@/lib/db/admin-queries";

const mockGetSession = getSession as jest.Mock;
const mockGetBannerRequests = getBannerRequests as jest.Mock;

function makeRequest(url = "http://localhost:3001/api/admin/banner-requests") {
  return new Request(url) as unknown as import("next/server").NextRequest;
}

describe("GET /api/admin/banner-requests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 for a non-admin session", async () => {
    mockGetSession.mockResolvedValue({ role: "model" });
    const response = await GET(makeRequest());
    expect(response.status).toBe(401);
    expect(mockGetBannerRequests).not.toHaveBeenCalled();
  });

  it("returns 401 without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    const response = await GET(makeRequest());
    expect(response.status).toBe(401);
  });

  it("lists requests for an admin session, forwarding the status filter", async () => {
    mockGetSession.mockResolvedValue({ role: "admin" });
    mockGetBannerRequests.mockResolvedValue([{ id: "r1", status: "PENDING" }]);

    const response = await GET(makeRequest("http://localhost:3001/api/admin/banner-requests?status=PENDING"));
    expect(response.status).toBe(200);
    expect(mockGetBannerRequests).toHaveBeenCalledWith({ status: "PENDING" });

    const data = await response.json();
    expect(data.requests).toHaveLength(1);
  });
});
