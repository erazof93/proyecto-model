/**
 * @jest-environment node
 */

const mockRepo = { insert: jest.fn().mockResolvedValue({}) };

jest.mock("../data-source", () => ({
  getRepo: jest.fn(async () => mockRepo),
}));

import { recordInteraction } from "../interactions";

beforeEach(() => jest.clearAllMocks());

it("inserta una fila con el model_id y el tipo (sin SELECT de vuelta)", async () => {
  await recordInteraction("m1", "WHATSAPP_CLICK");
  expect(mockRepo.insert).toHaveBeenCalledWith({
    model_id: "m1",
    interaction_type: "WHATSAPP_CLICK",
  });
});

it("acepta INSTAGRAM_CLICK y PROFILE_VIEW", async () => {
  await recordInteraction("m2", "INSTAGRAM_CLICK");
  await recordInteraction("m3", "PROFILE_VIEW");
  expect(mockRepo.insert).toHaveBeenNthCalledWith(1, expect.objectContaining({ interaction_type: "INSTAGRAM_CLICK" }));
  expect(mockRepo.insert).toHaveBeenNthCalledWith(2, expect.objectContaining({ interaction_type: "PROFILE_VIEW" }));
});
