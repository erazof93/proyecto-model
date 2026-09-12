/**
 * @jest-environment node
 */

jest.mock("@/lib/auth/session", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/db/queries", () => ({
  createBannerRequest: jest.fn(),
  getBannerRequestsByModel: jest.fn(),
}));

import { GET, POST } from "../route";
import { getSession } from "@/lib/auth/session";
import { createBannerRequest, getBannerRequestsByModel } from "@/lib/db/queries";

const mockGetSession = getSession as jest.Mock;
const mockCreateBannerRequest = createBannerRequest as jest.Mock;
const mockGetBannerRequestsByModel = getBannerRequestsByModel as jest.Mock;

function makePostRequest(body: unknown) {
  return new Request("http://localhost:3000/api/banner-requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

describe("GET /api/banner-requests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("returns 401 for a customer session (no model profile)", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "customer" });
    const response = await GET();
    expect(response.status).toBe(401);
  });

  it("lists the model's own requests for role=model", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "model", modelId: "m1" });
    mockGetBannerRequestsByModel.mockResolvedValue([{ id: "r1", status: "PENDING" }]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(mockGetBannerRequestsByModel).toHaveBeenCalledWith("m1");
    const data = await response.json();
    expect(data.requests).toHaveLength(1);
  });

  it("also works for role=both", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "both", modelId: "m1" });
    mockGetBannerRequestsByModel.mockResolvedValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
  });
});

describe("POST /api/banner-requests", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 without a session", async () => {
    mockGetSession.mockResolvedValue(null);
    const response = await POST(makePostRequest({ title: "Verano" }));
    expect(response.status).toBe(401);
    expect(mockCreateBannerRequest).not.toHaveBeenCalled();
  });

  it("returns 401 for a customer session", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "customer" });
    const response = await POST(makePostRequest({ title: "Verano" }));
    expect(response.status).toBe(401);
    expect(mockCreateBannerRequest).not.toHaveBeenCalled();
  });

  it("returns 400 without a title", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "model", modelId: "m1" });
    mockGetBannerRequestsByModel.mockResolvedValue([]);
    const response = await POST(makePostRequest({ title: "  " }));
    expect(response.status).toBe(400);
    expect(mockCreateBannerRequest).not.toHaveBeenCalled();
  });

  it("returns 409 when there is already a pending request", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "model", modelId: "m1" });
    mockGetBannerRequestsByModel.mockResolvedValue([{ id: "r1", status: "PENDING" }]);
    const response = await POST(makePostRequest({ title: "Verano" }));
    expect(response.status).toBe(409);
    expect(mockCreateBannerRequest).not.toHaveBeenCalled();
  });

  it("creates the request using the modelId from the session and returns the Telegram link", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "both", modelId: "session-model-id" });
    mockGetBannerRequestsByModel.mockResolvedValue([{ id: "old", status: "REJECTED" }]);
    mockCreateBannerRequest.mockResolvedValue({ id: "r2", status: "PENDING" });

    // Un cliente malicioso intentando indicar OTRO modelId en el body: debe ignorarse.
    const response = await POST(
      makePostRequest({ title: "Verano 2026", description: "Promo", modelId: "someone-elses-id" }),
    );

    expect(response.status).toBe(201);
    expect(mockCreateBannerRequest).toHaveBeenCalledWith(
      "session-model-id",
      "Verano 2026",
      "Promo",
    );

    const data = await response.json();
    expect(data.telegramUrl).toContain("t.me/");
  });
});
