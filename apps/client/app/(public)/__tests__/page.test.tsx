/**
 * La home es pública y NO debe caer entera ("Algo salió mal") si una query a
 * Postgres falla puntualmente (p.ej. (EMAXCONNSESSION) del pooler de Supabase).
 *
 * Todo el contenido sale de `featured_listings` vía getFeaturedModelos:
 * `type: "BANNER"` → carrusel, `type: "TOP"` → grid "Modelos recomendadas".
 */

jest.mock("@/components/modelos/SearchFilters", () => ({ SearchFilters: () => null }));
jest.mock("@/components/modelos/FeaturedCarousel", () => ({
  FeaturedCarousel: () => null,
}));
jest.mock("@/components/modelos/ModelGrid", () => ({ ModelGrid: () => null }));
jest.mock("@/lib/db/queries", () => ({
  getFeaturedModelos: jest.fn(),
  getFilterOptions: jest.fn(),
}));

import HomePage from "../page";
import { getFeaturedModelos, getFilterOptions } from "@/lib/db/queries";

const mockFeatured = getFeaturedModelos as jest.Mock;
const mockFilterOptions = getFilterOptions as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockFeatured.mockResolvedValue([]);
  mockFilterOptions.mockResolvedValue({ cities: [], genders: [], services: [] });
});

afterEach(() => (console.error as jest.Mock).mockRestore?.());

it("degrada a listas vacías (no lanza) cuando la BD falla", async () => {
  const dbDown = new Error("(EMAXCONNSESSION) max clients reached in session mode");
  mockFeatured.mockRejectedValue(dbDown);

  await expect(HomePage()).resolves.toBeTruthy();
  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining("[home]"),
    dbDown,
  );
});

it("renderiza normalmente cuando la BD responde", async () => {
  mockFeatured.mockResolvedValue([{ id: "1" }]);

  await expect(HomePage()).resolves.toBeTruthy();
  expect(console.error).not.toHaveBeenCalled();
});

it("el carrusel pide BANNER y las recomendadas piden TOP (ambas de featured_listings)", async () => {
  await HomePage();
  expect(mockFeatured).toHaveBeenCalledWith({ type: "BANNER" });
  expect(mockFeatured).toHaveBeenCalledWith({ type: "TOP" });
});
