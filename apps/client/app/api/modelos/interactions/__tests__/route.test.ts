/**
 * @jest-environment node
 */

jest.mock("@/lib/db/interactions", () => ({ recordInteraction: jest.fn() }));

import { POST } from "../route";
import { recordInteraction } from "@/lib/db/interactions";

const mockRecord = recordInteraction as jest.Mock;

const req = (body: unknown) =>
  new Request("http://localhost/api/modelos/interactions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

beforeEach(() => jest.clearAllMocks());

it("registra un click válido → 201", async () => {
  mockRecord.mockResolvedValue(undefined);
  const res = await POST(req({ model_id: "m1", interaction_type: "WHATSAPP_CLICK" }));
  expect(res.status).toBe(201);
  await expect(res.json()).resolves.toEqual({ ok: true });
  expect(mockRecord).toHaveBeenCalledWith("m1", "WHATSAPP_CLICK");
});

it("rechaza un interaction_type desconocido → 400", async () => {
  const res = await POST(req({ model_id: "m1", interaction_type: "HACK" }));
  expect(res.status).toBe(400);
  expect(mockRecord).not.toHaveBeenCalled();
});

it("rechaza sin model_id → 400", async () => {
  const res = await POST(req({ interaction_type: "WHATSAPP_CLICK" }));
  expect(res.status).toBe(400);
});

it("model_id inexistente (viola la FK) → 404", async () => {
  mockRecord.mockRejectedValue(new Error('insert or update violates foreign key constraint'));
  const res = await POST(req({ model_id: "nope", interaction_type: "INSTAGRAM_CLICK" }));
  expect(res.status).toBe(404);
});
