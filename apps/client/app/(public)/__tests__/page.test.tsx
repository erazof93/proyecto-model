/**
 * La home es pública y NO debe caer entera ("Algo salió mal") si una query a
 * Postgres falla puntualmente (p.ej. (EMAXCONNSESSION) del pooler de Supabase).
 *
 * Carrusel = getFeaturedModelos({ type: "BANNER" }).
 * "Modelos recomendadas" = getModelos({ featuredFirst: true }) — TODAS las
 * modelos con las TOP primero; getFeaturedModelos({ type: "TOP" }) da los ids
 * para el badge VIP.
 */

jest.mock("@/components/modelos/SearchFilters", () => ({ SearchFilters: () => null }));
jest.mock("@/components/modelos/FeaturedCarousel", () => ({
  FeaturedCarousel: () => null,
}));
jest.mock("@/components/modelos/ModelGrid", () => ({ ModelGrid: () => null }));
jest.mock("@/lib/db/queries", () => ({
  getFeaturedModelos: jest.fn(),
  getModelos: jest.fn(),
  getFilterOptions: jest.fn(),
}));

import HomePage from "../page";
import { getFeaturedModelos, getFilterOptions, getModelos } from "@/lib/db/queries";

const mockFeatured = getFeaturedModelos as jest.Mock;
const mockModelos = getModelos as jest.Mock;
const mockFilterOptions = getFilterOptions as jest.Mock;

const emptyPage = { data: [], page: 1, pageSize: 50, total: 0, totalPages: 0 };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockFeatured.mockResolvedValue([]);
  mockModelos.mockResolvedValue(emptyPage);
  mockFilterOptions.mockResolvedValue({ cities: [], genders: [], services: [] });
});

afterEach(() => (console.error as jest.Mock).mockRestore?.());

it("degrada a listas vacías (no lanza) cuando la BD falla", async () => {
  const dbDown = new Error("(EMAXCONNSESSION) max clients reached in session mode");
  mockFeatured.mockRejectedValue(dbDown);
  mockModelos.mockRejectedValue(dbDown);

  await expect(HomePage()).resolves.toBeTruthy();
  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining("[home]"),
    dbDown,
  );
});

it("renderiza normalmente cuando la BD responde", async () => {
  mockFeatured.mockResolvedValue([{ id: "1" }]);
  mockModelos.mockResolvedValue({ ...emptyPage, data: [{ id: "2" }], total: 1, totalPages: 1 });

  await expect(HomePage()).resolves.toBeTruthy();
  expect(console.error).not.toHaveBeenCalled();
});

it("carrusel pide BANNER; recomendadas pide TODAS con featuredFirst; badge VIP pide TOP", async () => {
  await HomePage();
  expect(mockFeatured).toHaveBeenCalledWith({ type: "BANNER" });
  expect(mockFeatured).toHaveBeenCalledWith({ type: "TOP" });
  expect(mockModelos).toHaveBeenCalledWith({ pageSize: 50, featuredFirst: true });
});
