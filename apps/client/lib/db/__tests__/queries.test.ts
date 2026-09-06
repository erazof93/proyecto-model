// El pool real (default export de ./connection) es un objeto con un método
// .query — se mockea así, no como una función `query` suelta en el módulo
// (esa forma no coincide con lo que connection.ts realmente exporta).
jest.mock("../connection", () => ({
  __esModule: true,
  default: { query: jest.fn() },
}));

import pool from "../connection";
import { getModelos, getModeloBySlug, getReviews } from "../queries";

const mockQuery = pool.query as jest.Mock;

describe("getModelos", () => {
  beforeEach(() => mockQuery.mockReset());

  it("only queries active, verified models by default", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await getModelos();

    const [sql] = mockQuery.mock.calls[0];
    expect(sql).toContain("status = 'ACTIVE'");
    expect(sql).toContain("is_verified = true");
  });

  it("adds a gender filter as a parameterized condition, never string-interpolated", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await getModelos({ gender: "WOMAN" });

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("gender = $1");
    expect(sql).not.toContain("WOMAN");
    expect(params).toContain("WOMAN");
  });

  it("matches city against both the home city and the travel-cities array", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await getModelos({ city: "Callao" });

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("city = $1");
    expect(sql).toContain("$1 = ANY(cities_travel)");
    expect(params).toEqual(expect.arrayContaining(["Callao"]));
  });

  it("strips the total_count window column out of the returned rows", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: "1", name: "Sofía", total_count: "3" }],
    });
    const result = await getModelos();

    expect(result.data[0]).not.toHaveProperty("total_count");
    expect(result.total).toBe(3);
  });

  it("computes totalPages from the total row count and page size", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: "1", total_count: "17" }],
    });
    const result = await getModelos({ pageSize: 8 });

    expect(result.total).toBe(17);
    expect(result.totalPages).toBe(3); // ceil(17 / 8)
  });

  it("returns totalPages of 1 (not 0) when there are no results", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await getModelos();
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("clamps pageSize to a maximum of 50", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    await getModelos({ pageSize: 500 });

    const [, params] = mockQuery.mock.calls[0];
    // LIMIT es el penúltimo parámetro (antes del OFFSET)
    expect(params[params.length - 2]).toBe(50);
  });
});

describe("getModeloBySlug", () => {
  beforeEach(() => mockQuery.mockReset());

  it("queries by slug and excludes suspended models", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [{ id: "1", slug: "sofia-lima" }] });
    const result = await getModeloBySlug("sofia-lima");

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("slug = $1");
    expect(sql).toContain("status <> 'SUSPENDED'");
    expect(params).toEqual(["sofia-lima"]);
    expect(result?.slug).toBe("sofia-lima");
  });

  it("returns null when no model matches", async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] });
    const result = await getModeloBySlug("no-existe");
    expect(result).toBeNull();
  });
});

describe("getReviews", () => {
  beforeEach(() => mockQuery.mockReset());

  it("queries reviews for the given model ordered by most recent", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: "r1", model_id: "m1", rating: 5, created_at: "2026-01-01" }],
    });
    const result = await getReviews("m1");

    const [sql, params] = mockQuery.mock.calls[0];
    expect(sql).toContain("WHERE model_id = $1");
    expect(sql).toContain("ORDER BY created_at DESC");
    expect(params).toEqual(["m1"]);
    expect(result).toHaveLength(1);
  });
});
