/**
 * El listado público /modelos tampoco debe caer entero si la BD falla.
 */

jest.mock("@/components/modelos/FilterSidebar", () => ({ FilterSidebar: () => null }));
jest.mock("@/components/modelos/ModelGrid", () => ({ ModelGrid: () => null }));
jest.mock("@/components/modelos/Pagination", () => ({ Pagination: () => null }));
jest.mock("@/components/ui/Logo", () => ({ Logo: () => null }));
jest.mock("@/lib/db/queries", () => ({ getModelos: jest.fn(), getFilterOptions: jest.fn() }));

import ModelosPage from "../page";
import { getFilterOptions, getModelos } from "@/lib/db/queries";

const mockModelos = getModelos as jest.Mock;
const mockFilterOptions = getFilterOptions as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockFilterOptions.mockResolvedValue({ cities: [], genders: [], services: [] });
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
