/**
 * @jest-environment node
 *
 * queries.ts se reescribió sobre TypeORM: en vez de mockear el pool `pg` y
 * afirmar sobre strings SQL, mockeamos ../data-source y afirmamos sobre las
 * llamadas al repositorio / QueryBuilder (fragmentos + parámetros nombrados,
 * nunca interpolados).
 */

type QbCall = { method: string; args: unknown[] };

const qbFactory = () => {
  const calls: QbCall[] = [];
  const qb: Record<string, unknown> = { __calls: calls };
  const chain = [
    "where",
    "andWhere",
    "orderBy",
    "addOrderBy",
    "groupBy",
    "skip",
    "take",
    "limit",
    "select",
    "addSelect",
    "leftJoin",
    "leftJoinAndSelect",
    "innerJoinAndSelect",
  ];
  for (const m of chain) {
    qb[m] = jest.fn((...args: unknown[]) => {
      calls.push({ method: m, args });
      return qb;
    });
  }
  qb.getManyAndCount = jest.fn().mockResolvedValue([[], 0]);
  qb.getOne = jest.fn().mockResolvedValue(null);
  qb.getMany = jest.fn().mockResolvedValue([]);
  qb.getRawMany = jest.fn().mockResolvedValue([]);
  qb.getRawOne = jest.fn().mockResolvedValue({ max: "0" });
  return qb;
};

const mockRepo = {
  createQueryBuilder: jest.fn(),
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  existsBy: jest.fn().mockResolvedValue(false),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({}),
};

jest.mock("../data-source", () => ({
  getRepo: jest.fn(async () => mockRepo),
  initializeDataSource: jest.fn(async () => ({
    transaction: jest.fn(),
  })),
}));

import {
  getFeaturedModelos,
  getFilterOptions,
  getModeloBySlug,
  getModelos,
  getReviews,
} from "../queries";

/** Última QB creada, para inspeccionar sus llamadas encadenadas. */
let lastQb: ReturnType<typeof qbFactory>;

beforeEach(() => {
  jest.clearAllMocks();
  mockRepo.createQueryBuilder.mockImplementation(() => {
    lastQb = qbFactory();
    return lastQb;
  });
  mockRepo.find.mockResolvedValue([]);
  mockRepo.findOne.mockResolvedValue(null);
});

/** Todos los fragmentos SQL (primer arg string) pasados a where/andWhere. */
const whereFragments = () =>
  (lastQb.__calls as QbCall[])
    .filter((c) => c.method === "where" || c.method === "andWhere")
    .map((c) => String(c.args[0]));

/** Objeto de parámetros combinado de todas las llamadas where/andWhere. */
const whereParams = () =>
  Object.assign(
    {},
    ...(lastQb.__calls as QbCall[])
      .filter((c) => c.method === "where" || c.method === "andWhere")
      .map((c) => c.args[1] ?? {}),
  );

describe("getModelos", () => {
  it("only queries active, verified models by default", async () => {
    await getModelos();
    expect(whereFragments()).toEqual(
      expect.arrayContaining(["m.status = :status", "m.is_verified = :verified"]),
    );
    expect(whereParams()).toMatchObject({ status: "ACTIVE", verified: true });
  });

  it("adds a gender filter as a named parameter, never string-interpolated", async () => {
    await getModelos({ gender: "WOMAN" });
    const frags = whereFragments();
    expect(frags).toContain("m.gender = :gender");
    expect(frags.join(" ")).not.toContain("WOMAN");
    expect(whereParams()).toMatchObject({ gender: "WOMAN" });
  });

  it("matches city against both the home city and the travel-cities array", async () => {
    await getModelos({ city: "Callao" });
    const cityFrag = whereFragments().find((f) => f.includes(":city"));
    expect(cityFrag).toContain("m.city = :city");
    expect(cityFrag).toContain(":city = ANY(m.cities_travel)");
    expect(whereParams()).toMatchObject({ city: "Callao" });
  });

  it("clamps pageSize to a maximum of 50", async () => {
    await getModelos({ pageSize: 500 });
    expect(lastQb.take).toHaveBeenCalledWith(50);
  });

  it("computes totalPages from the total count and page size", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getManyAndCount as jest.Mock).mockResolvedValue([[], 17]);
      return lastQb;
    });
    const result = await getModelos({ pageSize: 8 });
    expect(result.total).toBe(17);
    expect(result.totalPages).toBe(3); // ceil(17 / 8)
  });

  it("returns totalPages of 1 (not 0) when there are no results", async () => {
    const result = await getModelos();
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(1);
  });

  it("never leaks the total_count window column into the rows (TypeORM returns clean entities)", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getManyAndCount as jest.Mock).mockResolvedValue([[{ id: "1", name: "Sofía" }], 1]);
      return lastQb;
    });
    const result = await getModelos();
    expect(result.data[0]).not.toHaveProperty("total_count");
  });
});

describe("getModeloBySlug", () => {
  it("queries by slug and excludes suspended models", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getOne as jest.Mock).mockResolvedValue({ id: "1", slug: "sofia-lima" });
      return lastQb;
    });
    const result = await getModeloBySlug("sofia-lima");

    const frags = whereFragments();
    expect(frags).toContain("m.slug = :slug");
    expect(frags).toContain("m.status <> :suspended");
    expect(whereParams()).toMatchObject({ slug: "sofia-lima", suspended: "SUSPENDED" });
    expect(result?.slug).toBe("sofia-lima");
  });

  it("returns null when no model matches", async () => {
    const result = await getModeloBySlug("no-existe");
    expect(result).toBeNull();
  });
});

describe("getReviews", () => {
  it("queries reviews for the given model ordered by most recent", async () => {
    mockRepo.find.mockResolvedValueOnce([
      { id: "r1", model_id: "m1", rating: 5, created_at: "2026-01-01" },
    ]);
    const result = await getReviews("m1");

    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { model_id: "m1" },
      order: { created_at: "DESC" },
    });
    expect(result).toHaveLength(1);
  });
});

describe("getFeaturedModelos", () => {
  it("se apoya en featured_listings vigentes (ACTIVE + no expiradas) de modelos ACTIVE", async () => {
    await getFeaturedModelos();
    const frags = whereFragments();
    expect(frags).toContain("fl.status = :status");
    expect(frags).toContain("fl.end_date > NOW()");
    expect(frags).toContain("m.status = :mstatus");
    expect(whereParams()).toMatchObject({ status: "ACTIVE", mstatus: "ACTIVE" });
  });

  it("ordena fijadas primero y devuelve la modelo de cada fila", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getMany as jest.Mock).mockResolvedValue([
        { id: "fl1", model: { id: "m1", name: "Sofía" } },
        { id: "fl2", model: { id: "m2", name: "María" } },
      ]);
      return lastQb;
    });
    const result = await getFeaturedModelos();
    expect(result.map((m) => m.id)).toEqual(["m1", "m2"]);
    const orderCalls = (lastQb.__calls as { method: string; args: unknown[] }[])
      .filter((c) => c.method === "orderBy" || c.method === "addOrderBy")
      .map((c) => c.args);
    expect(orderCalls[0]).toEqual(["fl.is_pinned", "DESC"]);
  });
});

describe("getFilterOptions", () => {
  it("devuelve ciudades/géneros de modelos visibles y servicios = checklists activos", async () => {
    mockRepo.createQueryBuilder
      .mockImplementationOnce(() => {
        lastQb = qbFactory();
        (lastQb.getRawMany as jest.Mock).mockResolvedValue([{ city: "Lima" }, { city: "Callao" }]);
        return lastQb;
      })
      .mockImplementationOnce(() => {
        lastQb = qbFactory();
        (lastQb.getRawMany as jest.Mock).mockResolvedValue([{ gender: "WOMAN" }]);
        return lastQb;
      });
    mockRepo.find.mockResolvedValueOnce([{ name: "Masaje" }, { name: "Sesión fotos" }]);

    const result = await getFilterOptions();
    expect(result).toEqual({
      cities: ["Lima", "Callao"],
      genders: ["WOMAN"],
      services: ["Masaje", "Sesión fotos"],
    });
  });

  it("solo mira modelos ACTIVE y verificadas", async () => {
    await getFilterOptions();
    // la última QB creada es la de géneros; ambas comparten el mismo prefijo
    expect(whereFragments()).toEqual(
      expect.arrayContaining(["m.status = :status", "m.is_verified = :verified"]),
    );
    expect(whereParams()).toMatchObject({ status: "ACTIVE", verified: true });
  });
});
