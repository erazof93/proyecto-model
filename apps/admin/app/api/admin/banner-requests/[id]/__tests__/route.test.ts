/**
 * @jest-environment node
 */

jest.mock("@/lib/auth/session", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/db/admin-queries", () => ({
  approveBannerRequest: jest.fn(),
  rejectBannerRequest: jest.fn(),
}));

import { PUT } from "../route";
import { getSession } from "@/lib/auth/session";
import { approveBannerRequest, rejectBannerRequest } from "@/lib/db/admin-queries";

const mockGetSession = getSession as jest.Mock;
const mockApprove = approveBannerRequest as jest.Mock;
const mockReject = rejectBannerRequest as jest.Mock;

function makeRequest(body: unknown) {
  return new Request("http://localhost:3001/api/admin/banner-requests/r1", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

const ctx = { params: Promise.resolve({ id: "r1" }) };

describe("PUT /api/admin/banner-requests/[id]", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 for a non-admin session", async () => {
    mockGetSession.mockResolvedValue({ role: "model" });
    const response = await PUT(makeRequest({ action: "approve" }), ctx);
    expect(response.status).toBe(401);
    expect(mockApprove).not.toHaveBeenCalled();
  });

  it("returns 400 for an invalid action", async () => {
    mockGetSession.mockResolvedValue({ sub: "admin1", role: "admin" });
    const response = await PUT(makeRequest({ action: "delete" }), ctx);
    expect(response.status).toBe(400);
  });

  it("approves and creates a featured listing by default", async () => {
    mockGetSession.mockResolvedValue({ sub: "admin1", role: "admin" });
    mockApprove.mockResolvedValue({ id: "r1", status: "APPROVED", featured_listing_id: "fl1" });

    const response = await PUT(makeRequest({ action: "approve" }), ctx);
    expect(response.status).toBe(200);
    expect(mockApprove).toHaveBeenCalledWith("r1", "admin1", undefined, true);
  });

  it("approves without creating a featured listing when createFeaturedListing=false", async () => {
    mockGetSession.mockResolvedValue({ sub: "admin1", role: "admin" });
    mockApprove.mockResolvedValue({ id: "r1", status: "APPROVED", featured_listing_id: null });

    await PUT(makeRequest({ action: "approve", createFeaturedListing: false, notes: "ok" }), ctx);
    expect(mockApprove).toHaveBeenCalledWith("r1", "admin1", "ok", false);
  });

  it("returns 404 when approve finds nothing to update", async () => {
    mockGetSession.mockResolvedValue({ sub: "admin1", role: "admin" });
    mockApprove.mockResolvedValue(null);
    const response = await PUT(makeRequest({ action: "approve" }), ctx);
    expect(response.status).toBe(404);
  });

  it("rejects with notes", async () => {
    mockGetSession.mockResolvedValue({ sub: "admin1", role: "admin" });
    mockReject.mockResolvedValue({ id: "r1", status: "REJECTED" });

    const response = await PUT(makeRequest({ action: "reject", notes: "foto de mala calidad" }), ctx);
    expect(response.status).toBe(200);
    expect(mockReject).toHaveBeenCalledWith("r1", "admin1", "foto de mala calidad");
  });
});
