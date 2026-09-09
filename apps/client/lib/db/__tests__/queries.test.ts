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

const mockDsQuery = jest.fn();

jest.mock("../data-source", () => ({
  getRepo: jest.fn(async () => mockRepo),
  initializeDataSource: jest.fn(async () => ({
    transaction: jest.fn(),
    query: mockDsQuery,
  })),
}));

import {
  getFeaturedModelos,
  getFilterOptions,
  getModeloBySlug,
  getModelos,
  getModelosOrdenados,
  getReviews,
  getVipCarousel,
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
  it("solo filtra por status ACTIVE (verificada = badge, no filtro de visibilidad)", async () => {
    await getModelos();
    expect(whereFragments()).toEqual(["m.status = :status"]);
    expect(whereFragments().join(" ")).not.toContain("is_verified");
    expect(whereParams()).toMatchObject({ status: "ACTIVE" });
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

  it("sin featuredFirst ordena solo por m.created_at DESC", async () => {
    await getModelos();
    const orderCalls = (lastQb.__calls as QbCall[]).filter(
      (c) => c.method === "orderBy" || c.method === "addOrderBy",
    );
    expect(orderCalls).toEqual([{ method: "orderBy", args: ["m.created_at", "DESC"] }]);
  });

  it("isNew acota a las creadas en los últimos 7 días (literal, sin params)", async () => {
    await getModelos({ isNew: true });
    const frag = whereFragments().find((f) => f.includes("created_at"));
    expect(frag).toBe("m.created_at > NOW() - INTERVAL '7 days'");
    expect(frag).not.toMatch(/:\w|\$\{/);
  });

  it("sin isNew no añade el filtro de fecha", async () => {
    await getModelos();
    expect(whereFragments().some((f) => f.includes("INTERVAL"))).toBe(false);
  });

  it("featuredFirst antepone las modelos con una destacada TOP vigente", async () => {
    await getModelos({ featuredFirst: true });
    const orderCalls = (lastQb.__calls as QbCall[]).filter(
      (c) => c.method === "orderBy" || c.method === "addOrderBy",
    );
    const primary = String(orderCalls[0]?.args[0]);
    expect(primary).toContain("EXISTS");
    expect(primary).toContain("featured_listings");
    expect(primary).toContain("fl.type = 'TOP'");
    expect(primary).toContain("fl.status = 'ACTIVE'");
    expect(orderCalls[0]?.args[1]).toBe("DESC");
    expect(orderCalls[1]).toEqual({ method: "addOrderBy", args: ["m.created_at", "DESC"] });
    // sin interpolar valores de usuario
    expect(primary).not.toMatch(/\$\{/);
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

  it("no filtra por type cuando no se pasa", async () => {
    await getFeaturedModelos();
    expect(whereFragments()).not.toContain("fl.type = :type");
  });

  it("no aplica ningún cap (.take/.limit): las destacadas son curadas por el admin", async () => {
    await getFeaturedModelos({ type: "TOP" });
    expect(lastQb.take).not.toHaveBeenCalled();
    expect(lastQb.limit).not.toHaveBeenCalled();
  });

  it("filtra por type como parámetro nombrado cuando se pasa BANNER", async () => {
    await getFeaturedModelos({ type: "BANNER" });
    expect(whereFragments()).toContain("fl.type = :type");
    expect(whereFragments().join(" ")).not.toContain("BANNER");
    expect(whereParams()).toMatchObject({ type: "BANNER" });
  });
});

describe("getVipCarousel", () => {
  it("toma hasta `limit` de las destacadas TOP vigentes", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getMany as jest.Mock).mockResolvedValue(
        Array.from({ length: 12 }, (_, i) => ({ model: { id: `v${i}`, name: `V${i}` } })),
      );
      return lastQb;
    });
    const out = await getVipCarousel(8);
    expect(out).toHaveLength(8);
    expect(whereFragments()).toContain("fl.type = :type");
    expect(whereParams()).toMatchObject({ type: "TOP" });
  });

  it("si hay menos VIP que `limit`, devuelve todas", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getMany as jest.Mock).mockResolvedValue([
        { model: { id: "v1" } },
        { model: { id: "v2" } },
      ]);
      return lastQb;
    });
    expect(await getVipCarousel(8)).toHaveLength(2);
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

  it("solo mira modelos ACTIVE (sin filtrar por verificación)", async () => {
    await getFilterOptions();
    // la última QB creada es la de géneros; ambas comparten el mismo prefijo
    expect(whereFragments()).toEqual(expect.arrayContaining(["m.status = :status"]));
    expect(whereFragments().join(" ")).not.toContain("is_verified");
    expect(whereParams()).toMatchObject({ status: "ACTIVE" });
  });
});

describe("getModelosOrdenados", () => {
  const M = (id: string, extra: Record<string, unknown> = {}) => ({
    id,
    name: `M${id}`,
    gender: "WOMAN",
    city: "Lima",
    services: [],
    cities_travel: [],
    bio: null,
    ...extra,
  });

  /** Deja listos los 5 tramos (top, nuevas, postVip, activas, inactivas). */
  const setTramos = (t: {
    top?: unknown[];
    nuevas?: unknown[];
    postVip?: unknown[];
    activas?: unknown[];
    inactivas?: unknown[];
  }) => {
    mockDsQuery
      .mockResolvedValueOnce(t.top ?? [])
      .mockResolvedValueOnce(t.nuevas ?? [])
      .mockResolvedValueOnce(t.postVip ?? [])
      .mockResolvedValueOnce(t.activas ?? [])
      .mockResolvedValueOnce(t.inactivas ?? []);
  };

  it("concatena los tramos por prioridad: TOP → NUEVAS → POST-VIP → ACTIVAS → INACTIVAS", async () => {
    setTramos({
      top: [M("t1")],
      nuevas: [M("n1")],
      postVip: [M("p1")],
      activas: [M("a1")],
      inactivas: [M("i1")],
    });
    const r = await getModelosOrdenados({ pageSize: 50 });
    expect(r.data.map((m) => m.id)).toEqual(["t1", "n1", "p1", "a1", "i1"]);
    expect(r.featuredIds).toEqual(["t1"]);
  });

  it("las INACTIVAS quedan al final pero no desaparecen", async () => {
    setTramos({ top: [M("t1")], inactivas: [M("i1"), M("i2")] });
    const r = await getModelosOrdenados({ pageSize: 50 });
    expect(r.data.map((m) => m.id)).toEqual(["t1", "i1", "i2"]);
  });

  it("deduplica: una modelo en dos tramos se queda en el más alto", async () => {
    setTramos({ nuevas: [M("x")], activas: [M("x")], inactivas: [M("y")] });
    const r = await getModelosOrdenados({ pageSize: 50 });
    expect(r.data.map((m) => m.id)).toEqual(["x", "y"]);
    expect(r.total).toBe(2);
  });

  it("isNew deja solo las creadas en los últimos 7 días", async () => {
    const reciente = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const vieja = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    setTramos({
      nuevas: [M("new", { created_at: reciente })],
      activas: [M("old", { created_at: vieja })],
    });
    const r = await getModelosOrdenados({ isNew: true, pageSize: 50 });
    expect(r.data.map((m) => m.id)).toEqual(["new"]);
    expect(r.total).toBe(1);
  });

  it("sin isNew no filtra por fecha", async () => {
    const vieja = new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString();
    setTramos({ activas: [M("old", { created_at: vieja })] });
    const r = await getModelosOrdenados({ pageSize: 50 });
    expect(r.data.map((m) => m.id)).toEqual(["old"]);
  });

  it("filtra por gender/city/service/search en memoria", async () => {
    setTramos({
      activas: [
        M("a", { gender: "WOMAN", city: "Lima", services: ["Masaje"], name: "Ana" }),
        M("b", { gender: "MAN", city: "Lima", services: ["Masaje"], name: "Beto" }),
        M("c", { gender: "WOMAN", city: "Callao", services: ["Fotos"], name: "Ana Lu" }),
      ],
    });
    const r = await getModelosOrdenados({ gender: "WOMAN", city: "Lima", pageSize: 50 });
    expect(r.data.map((m) => m.id)).toEqual(["a"]);
  });

  it("pagina sobre el resultado ya ordenado", async () => {
    setTramos({ activas: [M("1"), M("2"), M("3"), M("4"), M("5")] });
    const r = await getModelosOrdenados({ page: 2, pageSize: 2 });
    expect(r.data.map((m) => m.id)).toEqual(["3", "4"]);
    expect(r.total).toBe(5);
    expect(r.totalPages).toBe(3);
  });

  it("type='TOP' deja SOLO las VIP (tramo TOP); combina con otros filtros", async () => {
    setTramos({
      top: [
        M("vip1", { gender: "WOMAN", city: "Lima" }),
        M("vip2", { gender: "MAN", city: "Lima" }),
      ],
      activas: [M("free1", { gender: "WOMAN", city: "Lima" })],
    });
    const soloVip = await getModelosOrdenados({ type: "TOP", pageSize: 50 });
    expect(soloVip.data.map((m) => m.id)).toEqual(["vip1", "vip2"]);
    expect(soloVip.total).toBe(2);
  });

  it("type='TOP' + gender aplica ambos filtros", async () => {
    setTramos({
      top: [
        M("vip1", { gender: "WOMAN" }),
        M("vip2", { gender: "MAN" }),
      ],
      activas: [M("free1", { gender: "WOMAN" })],
    });
    const r = await getModelosOrdenados({ type: "TOP", gender: "WOMAN", pageSize: 50 });
    expect(r.data.map((m) => m.id)).toEqual(["vip1"]);
  });

  it("sin type devuelve todos los tramos", async () => {
    setTramos({ top: [M("vip1")], activas: [M("free1")] });
    const r = await getModelosOrdenados({ pageSize: 50 });
    expect(r.data.map((m) => m.id)).toEqual(["vip1", "free1"]);
  });

  it("la 1ª query (tramo TOP) agrupa por modelo y ordena por fijadas + order_index", async () => {
    setTramos({});
    await getModelosOrdenados();
    const topSql = String(mockDsQuery.mock.calls[0][0]);
    expect(topSql).toContain("GROUP BY m.id");
    expect(topSql).toContain("fl.type = 'TOP'");
    expect(topSql).toContain("fl.end_date > NOW()");
    expect(topSql).toContain("ORDER BY _pinned DESC, _ord ASC");
  });

  it("no filtra por is_verified en ningún tramo (verificada = badge)", async () => {
    setTramos({});
    await getModelosOrdenados();
    for (const call of mockDsQuery.mock.calls) {
      expect(String(call[0])).not.toContain("is_verified");
    }
  });
});
