/**
 * @jest-environment node
 */

jest.mock("@/lib/db/checklists", () => ({ listActiveChecklists: jest.fn() }));

import { GET } from "../route";
import { listActiveChecklists } from "@/lib/db/checklists";

const mockList = listActiveChecklists as jest.Mock;

beforeEach(() => jest.clearAllMocks());

it("devuelve los checklists activos", async () => {
  mockList.mockResolvedValue([{ id: "1", name: "Masaje", is_active: true }]);
  const res = await GET();
  expect(res.status).toBe(200);
  await expect(res.json()).resolves.toEqual({
    checklists: [{ id: "1", name: "Masaje", is_active: true }],
  });
});

it("degrada a 500 con mensaje si la BD falla", async () => {
  mockList.mockRejectedValue(new Error("boom"));
  const res = await GET();
  expect(res.status).toBe(500);
  await expect(res.json()).resolves.toEqual({ error: "boom" });
});
