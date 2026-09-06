/**
 * @jest-environment node
 */

jest.mock("@/lib/auth/session", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/db/queries", () => ({ updateModelProfile: jest.fn() }));

import { PUT } from "../route";
import { getSession } from "@/lib/auth/session";
import { updateModelProfile } from "@/lib/db/queries";

const mockGetSession = getSession as jest.Mock;
const mockUpdateModelProfile = updateModelProfile as jest.Mock;

function makeRequest(body: unknown) {
  return new Request("http://localhost:3000/api/modelos/perfil", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

const validBody = { name: "Sofía", age: 24, gender: "WOMAN", bio: "Hola" };

describe("PUT /api/modelos/perfil", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns 401 when there is no session", async () => {
    mockGetSession.mockResolvedValue(null);
    const response = await PUT(makeRequest(validBody));
    expect(response.status).toBe(401);
    expect(mockUpdateModelProfile).not.toHaveBeenCalled();
  });

  it("returns 401 for a session with the wrong role, even with a valid body", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "customer" });
    const response = await PUT(makeRequest(validBody));
    expect(response.status).toBe(401);
  });

  it("returns 400 for a body missing required profileSchema fields (e.g. only bio)", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "model", modelId: "m1" });
    const response = await PUT(makeRequest({ bio: "Solo bio" }));
    expect(response.status).toBe(400);
    expect(mockUpdateModelProfile).not.toHaveBeenCalled();
  });

  it("updates using the modelId from the session, never one the client could supply", async () => {
    mockGetSession.mockResolvedValue({ sub: "u1", role: "model", modelId: "session-model-id" });
    mockUpdateModelProfile.mockResolvedValue({ id: "session-model-id", ...validBody });

    // Un cliente malicioso intentando indicar OTRO modelId en el body: debe ignorarse.
    const response = await PUT(makeRequest({ ...validBody, modelId: "someone-elses-id" }));
    expect(response.status).toBe(200);
    expect(mockUpdateModelProfile).toHaveBeenCalledWith(
      "session-model-id",
      expect.objectContaining({ name: "Sofía" }),
    );
  });
});
