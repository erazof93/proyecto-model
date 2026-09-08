/**
 * @jest-environment node
 */

import { NextResponse } from "next/server";

jest.mock("@/lib/auth/admin", () => ({ requireAdmin: jest.fn() }));
jest.mock("@/lib/db/checklists", () => ({
  listChecklists: jest.fn(),
  createChecklist: jest.fn(),
}));

import { GET, POST } from "../route";
import { requireAdmin } from "@/lib/auth/admin";
import { createChecklist, listChecklists } from "@/lib/db/checklists";

const mockRequireAdmin = requireAdmin as jest.Mock;
const mockList = listChecklists as jest.Mock;
const mockCreate = createChecklist as jest.Mock;

const asAdmin = () => mockRequireAdmin.mockResolvedValue({ session: { sub: "admin-1", role: "admin" } });
const asDenied = (status: number) =>
  mockRequireAdmin.mockResolvedValue({ error: NextResponse.json({ error: "x" }, { status }) });

const postReq = (body: unknown) =>
  new Request("http://localhost/api/admin/checklists", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => jest.clearAllMocks());

describe("guard", () => {
  it("GET corta con 401 cuando no hay sesión", async () => {
    asDenied(401);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(mockList).not.toHaveBeenCalled();
  });

  it("POST corta con 403 cuando la sesión no es admin", async () => {
    asDenied(403);
    const res = await POST(postReq({ name: "Masaje" }));
    expect(res.status).toBe(403);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("GET", () => {
  it("lista los checklists para el admin", async () => {
    asAdmin();
    mockList.mockResolvedValue([{ id: "1", name: "Masaje" }]);
    const res = await GET();
    expect(res.status).toBe(200);
    await expect(res.json()).resolves.toEqual({ checklists: [{ id: "1", name: "Masaje" }] });
  });
});

describe("POST", () => {
  beforeEach(asAdmin);

  it("rechaza sin nombre con 400", async () => {
    const res = await POST(postReq({ description: "x" }));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rechaza nombre en blanco con 400", async () => {
    const res = await POST(postReq({ name: "   " }));
    expect(res.status).toBe(400);
  });

  it("crea el servicio y responde 201", async () => {
    mockCreate.mockResolvedValue({ id: "c1", name: "Masaje", is_active: true });
    const res = await POST(postReq({ name: "  Masaje  " }));
    expect(res.status).toBe(201);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Masaje" }),
    );
    await expect(res.json()).resolves.toEqual({
      checklist: { id: "c1", name: "Masaje", is_active: true },
    });
  });

  it("mapea la violación de unicidad a 409", async () => {
    mockCreate.mockRejectedValue(new Error('duplicate key value violates unique constraint'));
    const res = await POST(postReq({ name: "Masaje" }));
    expect(res.status).toBe(409);
  });
});
