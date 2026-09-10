import {
  ASPECT_TOLERANCE,
  MAX_OUTPUT_BYTES,
  TARGET_ASPECT,
  TARGET_SIZE,
  needsManualCrop,
} from "../aspect";

describe("images/aspect", () => {
  it("define 3:4 para photo y 16:9 para banner", () => {
    expect(TARGET_ASPECT.photo).toBeCloseTo(0.75);
    expect(TARGET_ASPECT.banner).toBeCloseTo(16 / 9);
    expect(TARGET_SIZE.photo).toEqual({ width: 600, height: 800 });
    expect(TARGET_SIZE.banner).toEqual({ width: 1200, height: 675 });
    expect(MAX_OUTPUT_BYTES).toBe(400 * 1024);
  });

  describe("needsManualCrop", () => {
    it("no pide recorte para una foto exactamente 3:4", () => {
      expect(needsManualCrop(600, 800, "photo")).toBe(false);
      expect(needsManualCrop(1200, 1600, "photo")).toBe(false);
    });

    it("no pide recorte dentro de la tolerancia", () => {
      // 3:4 = 0.75; 0.75 + tolerancia justa sigue pasando
      const w = 100;
      const h = w / (TARGET_ASPECT.photo + ASPECT_TOLERANCE - 0.001);
      expect(needsManualCrop(w, h, "photo")).toBe(false);
    });

    it("pide recorte para una foto claramente horizontal", () => {
      expect(needsManualCrop(1920, 1080, "photo")).toBe(true);
    });

    it("pide recorte para un banner vertical", () => {
      expect(needsManualCrop(800, 1200, "banner")).toBe(true);
    });

    it("no pide recorte para un banner 16:9", () => {
      expect(needsManualCrop(1920, 1080, "banner")).toBe(false);
    });

    it("devuelve false si falta una dimensión", () => {
      expect(needsManualCrop(0, 800, "photo")).toBe(false);
      expect(needsManualCrop(600, 0, "photo")).toBe(false);
    });
  });
});
