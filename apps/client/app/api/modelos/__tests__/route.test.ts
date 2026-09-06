/**
 * @jest-environment node
 */

jest.mock("@/lib/db/queries", () => ({ getModelos: jest.fn() }));

import { NextRequest } from "next/server";
import { GET } from "../route";
import { getModelos } from "@/lib/db/queries";

const mockGetModelos = getModelos as jest.Mock;

describe("GET /api/modelos", () => {
  beforeEach(() => jest.clearAllMocks());

  it("returns the flat pagination shape our real getModelos produces (no nested `pagination` object)", async () => {
    mockGetModelos.mockResolvedValue({
      data: [{ id: "1", name: "Sofía" }],
      page: 1,
      pageSize: 8,
      total: 1,
      totalPages: 1,
    });

    const response = await GET(new NextRequest("http://localhost:3000/api/modelos"));
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data.data)).toBe(true);
    expect(data.page).toBe(1);
    expect(data.pageSize).toBe(8);
    expect(data.total).toBe(1);
    expect(data.totalPages).toBe(1);
    expect(data.pagination).toBeUndefined();
  });

  it("forwards the gender query param to getModelos", async () => {
    mockGetModelos.mockResolvedValue({ data: [], page: 1, pageSize: 8, total: 0, totalPages: 1 });

    await GET(new NextRequest("http://localhost:3000/api/modelos?gender=WOMAN"));
    expect(mockGetModelos).toHaveBeenCalledWith(expect.objectContaining({ gender: "WOMAN" }));
  });

  it("forwards the page query param, defaulting to 1 when absent or invalid", async () => {
    mockGetModelos.mockResolvedValue({ data: [], page: 2, pageSize: 8, total: 0, totalPages: 1 });
    await GET(new NextRequest("http://localhost:3000/api/modelos?page=2"));
    expect(mockGetModelos).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));

    mockGetModelos.mockClear();
    await GET(new NextRequest("http://localhost:3000/api/modelos"));
    expect(mockGetModelos).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }));
  });

  it("returns 500 with a message if the query layer throws", async () => {
    mockGetModelos.mockRejectedValue(new Error("connection refused"));
    const response = await GET(new NextRequest("http://localhost:3000/api/modelos"));
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("connection refused");
  });
});
