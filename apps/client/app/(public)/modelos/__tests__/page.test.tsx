/**
 * El listado público /modelos tampoco debe caer entero si la BD falla.
 */

jest.mock("@/components/modelos/FilterSidebar", () => ({ FilterSidebar: () => null }));
jest.mock("@/components/modelos/ModelGrid", () => ({ ModelGrid: () => null }));
jest.mock("@/components/modelos/Pagination", () => ({ Pagination: () => null }));
jest.mock("@/components/ui/Logo", () => ({ Logo: () => null }));
jest.mock("@/lib/db/queries", () => ({
  getModelos: jest.fn(),
  getFilterOptions: jest.fn(),
  getFeaturedModelos: jest.fn(),
}));

import ModelosPage from "../page";
import { getFeaturedModelos, getFilterOptions, getModelos } from "@/lib/db/queries";

const mockModelos = getModelos as jest.Mock;
const mockFilterOptions = getFilterOptions as jest.Mock;
const mockFeatured = getFeaturedModelos as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockFilterOptions.mockResolvedValue({ cities: [], genders: [], services: [] });
  mockFeatured.mockResolvedValue([]);
});

it("degrada a un listado vacío (no lanza) cuando la BD falla", async () => {
  mockModelos.mockRejectedValue(new Error("(EMAXCONNSESSION) max clients reached"));
  await expect(
    ModelosPage({ searchParams: Promise.resolve({}) }),
  ).resolves.toBeTruthy();
  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining("[modelos]"),
    expect.any(Error),
  );
});

it("pasa los filtros de searchParams a getModelos", async () => {
  mockModelos.mockResolvedValue({ data: [], page: 2, pageSize: 8, total: 0, totalPages: 0 });
  await ModelosPage({
    searchParams: Promise.resolve({ gender: "WOMAN", city: "Lima", page: "2" }),
  });
  expect(mockModelos).toHaveBeenCalledWith(
    expect.objectContaining({ gender: "WOMAN", city: "Lima", page: 2 }),
  );
});

it("pide el grid TOP solo en la primera página sin filtros", async () => {
  mockModelos.mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0, totalPages: 1 });
  await ModelosPage({ searchParams: Promise.resolve({}) });
  expect(mockFeatured).toHaveBeenCalledWith({ type: "TOP" });
});

it("NO pide el grid TOP cuando hay filtros o no es la primera página", async () => {
  mockModelos.mockResolvedValue({ data: [], page: 1, pageSize: 20, total: 0, totalPages: 1 });

  await ModelosPage({ searchParams: Promise.resolve({ city: "Lima" }) });
  await ModelosPage({ searchParams: Promise.resolve({ page: "2" }) });

  expect(mockFeatured).not.toHaveBeenCalled();
});
