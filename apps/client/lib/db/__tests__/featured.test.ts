/**
 * @jest-environment node
 */

type QbCall = { method: string; args: unknown[] };

const qbFactory = () => {
  const calls: QbCall[] = [];
  const qb: Record<string, unknown> = { __calls: calls };
  for (const m of [
    "leftJoinAndSelect",
    "innerJoinAndSelect",
    "where",
    "andWhere",
    "orderBy",
    "addOrderBy",
    "select",
    "take",
  ]) {
    qb[m] = jest.fn((...args: unknown[]) => {
      calls.push({ method: m, args });
      return qb;
    });
  }
  qb.getMany = jest.fn().mockResolvedValue([]);
  qb.getRawOne = jest.fn().mockResolvedValue({ max: "-1" });
  qb.getCount = jest.fn().mockResolvedValue(0);
  return qb;
};

let lastQb: ReturnType<typeof qbFactory>;

const mockRepo = {
  createQueryBuilder: jest.fn(() => {
    lastQb = qbFactory();
    return lastQb;
  }),
  create: jest.fn((x: unknown) => x),
  save: jest.fn(async (x: unknown) => ({ id: "fl-1", ...(x as object) })),
  findOne: jest.fn().mockResolvedValue(null),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
  existsBy: jest.fn().mockResolvedValue(true),
};

jest.mock("../data-source", () => ({
  getRepo: jest.fn(async () => mockRepo),
}));

import {
  addFeaturedListing,
  listFeaturedListings,
  modelExists,
  modelHasActiveFeatured,
  removeFeaturedListing,
} from "../featured";

beforeEach(() => {
  jest.clearAllMocks();
  mockRepo.createQueryBuilder.mockImplementation(() => {
    lastQb = qbFactory();
    return lastQb;
  });
  mockRepo.findOne.mockResolvedValue(null);
  mockRepo.delete.mockResolvedValue({ affected: 1 });
  mockRepo.existsBy.mockResolvedValue(true);
});

const whereFragments = () =>
  (lastQb.__calls as QbCall[])
    .filter((c) => c.method === "where" || c.method === "andWhere")
    .map((c) => String(c.args[0]));

describe("addFeaturedListing", () => {
  it("por defecto: TOP, price '0', 30 días, colocada al final del orden", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getRawOne as jest.Mock).mockResolvedValue({ max: "4" });
      return lastQb;
    });

    const before = Date.now();
    await addFeaturedListing({ model_id: "m1", created_by_admin_id: "admin-1" });
    const arg = mockRepo.create.mock.calls[0][0] as Record<string, unknown>;

    expect(arg.type).toBe("TOP");
    expect(arg.price).toBe("0");
    expect(arg.duration_days).toBe(30);
    expect(arg.status).toBe("ACTIVE");
    expect(arg.order_index).toBe(5); // max(4) + 1
    expect(arg.created_by_admin_id).toBe("admin-1");
    const end = (arg.end_date as Date).getTime();
    expect(end).toBeGreaterThan(before + 29 * 86400_000);
    expect(end).toBeLessThan(before + 31 * 86400_000);
  });

  it("order_index arranca en 0 cuando la tabla está vacía (COALESCE -1)", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getRawOne as jest.Mock).mockResolvedValue({ max: "-1" });
      return lastQb;
    });
    await addFeaturedListing({ model_id: "m1" });
    const arg = mockRepo.create.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.order_index).toBe(0);
  });

  it("respeta type=BANNER y duration_days custom", async () => {
    await addFeaturedListing({ model_id: "m1", type: "BANNER", duration_days: 7 });
    const arg = mockRepo.create.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.type).toBe("BANNER");
    expect(arg.duration_days).toBe(7);
  });

  it("ignora duration_days no positivo y vuelve a 30", async () => {
    await addFeaturedListing({ model_id: "m1", duration_days: -3 });
    const arg = mockRepo.create.mock.calls[0][0] as Record<string, unknown>;
    expect(arg.duration_days).toBe(30);
  });
});

describe("modelHasActiveFeatured", () => {
  it("filtra por modelo, status ACTIVE y end_date futura", async () => {
    (mockRepo.createQueryBuilder as jest.Mock).mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getCount as jest.Mock).mockResolvedValue(1);
      return lastQb;
    });
    const res = await modelHasActiveFeatured("m1");
    expect(res).toBe(true);
    expect(whereFragments()).toEqual(
      expect.arrayContaining([
        "fl.model_id = :modelId",
        "fl.status = :status",
        "fl.end_date > NOW()",
      ]),
    );
  });

  it("false cuando no hay filas vigentes", async () => {
    expect(await modelHasActiveFeatured("m1")).toBe(false);
  });
});

describe("listFeaturedListings", () => {
  it("ordena fijadas primero, luego order_index, luego created_at", async () => {
    await listFeaturedListings();
    const orderCalls = (lastQb.__calls as QbCall[])
      .filter((c) => c.method === "orderBy" || c.method === "addOrderBy")
      .map((c) => c.args);
    expect(orderCalls).toEqual([
      ["fl.is_pinned", "DESC"],
      ["fl.order_index", "ASC"],
      ["fl.created_at", "DESC"],
    ]);
  });

  it("aplana la relación model a sus campos mínimos", async () => {
    mockRepo.createQueryBuilder.mockImplementationOnce(() => {
      lastQb = qbFactory();
      (lastQb.getMany as jest.Mock).mockResolvedValue([
        {
          id: "fl-1",
          model_id: "m1",
          order_index: 0,
          model: { id: "m1", name: "Sofía", slug: "sofia", avatar_url: null, city: "Lima", status: "ACTIVE", bio: "secreto" },
        },
      ]);
      return lastQb;
    });
    const [row] = await listFeaturedListings();
    expect(row.model).toEqual({
      id: "m1",
      name: "Sofía",
      slug: "sofia",
      avatar_url: null,
      city: "Lima",
      status: "ACTIVE",
    });
    expect(row.model).not.toHaveProperty("bio");
  });
});

describe("modelExists / removeFeaturedListing", () => {
  it("modelExists delega en existsBy", async () => {
    mockRepo.existsBy.mockResolvedValue(false);
    expect(await modelExists("nope")).toBe(false);
  });

  it("removeFeaturedListing devuelve false si no borró nada", async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });
    expect(await removeFeaturedListing("nope")).toBe(false);
  });
});
