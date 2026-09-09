/**
 * @jest-environment node
 */

jest.mock("@/lib/db/queries", () => ({ getVipCarousel: jest.fn() }));
jest.mock("@/lib/db/helpers", () => ({ nextHourlyRefresh: jest.fn() }));

import { GET } from "../route";
import { getVipCarousel } from "@/lib/db/queries";
import { nextHourlyRefresh } from "@/lib/db/helpers";

const mockVips = getVipCarousel as jest.Mock;
const mockNext = nextHourlyRefresh as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockNext.mockReturnValue(1_800_000_000_000);
});

it("devuelve las VIP + nextRefresh y cachea 1h en el CDN", async () => {
  mockVips.mockResolvedValue([{ id: "v1" }, { id: "v2" }]);
  const res = await GET();

  expect(mockVips).toHaveBeenCalledWith(8);
  expect(res.status).toBe(200);
  expect(res.headers.get("Cache-Control")).toContain("s-maxage=3600");
  await expect(res.json()).resolves.toEqual({
    data: [{ id: "v1" }, { id: "v2" }],
    nextRefresh: new Date(1_800_000_000_000).toISOString(),
  });
});

it("degrada a 500 con mensaje si la BD falla", async () => {
  mockVips.mockRejectedValue(new Error("pool timeout"));
  const res = await GET();
  expect(res.status).toBe(500);
  await expect(res.json()).resolves.toEqual({ error: "pool timeout" });
});
