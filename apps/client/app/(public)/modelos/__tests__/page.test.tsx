/**
 * El listado público /modelos usa getModelosOrdenados (5 tramos + rotación) y
 * tampoco debe caer entero si la BD falla.
 */

jest.mock("@/components/modelos/FilterSidebar", () => ({ FilterSidebar: () => null }));
jest.mock("@/components/modelos/ModelGrid", () => ({ ModelGrid: () => null }));
jest.mock("@/components/modelos/Pagination", () => ({ Pagination: () => null }));
jest.mock("@/components/ui/Logo", () => ({ Logo: () => null }));
jest.mock("@/lib/db/queries", () => ({
  getModelosOrdenados: jest.fn(),
  getFilterOptions: jest.fn(),
}));

import ModelosPage from "../page";
import { getFilterOptions, getModelosOrdenados } from "@/lib/db/queries";

const mockOrdenados = getModelosOrdenados as jest.Mock;
const mockFilterOptions = getFilterOptions as jest.Mock;

const emptyResult = { data: [], page: 1, pageSize: 20, total: 0, totalPages: 1, featuredIds: [] };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockOrdenados.mockResolvedValue(emptyResult);
  mockFilterOptions.mockResolvedValue({ cities: [], genders: [], services: [] });
});

it("degrada a un listado vacío (no lanza) cuando la BD falla", async () => {
  mockOrdenados.mockRejectedValue(new Error("(EMAXCONNSESSION) max clients reached"));
  await expect(ModelosPage({ searchParams: Promise.resolve({}) })).resolves.toBeTruthy();
  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining("[modelos]"),
    expect.any(Error),
  );
});

it("pasa los filtros de searchParams a getModelosOrdenados", async () => {
  await ModelosPage({
    searchParams: Promise.resolve({ gender: "WOMAN", city: "Lima", q: "sofia", page: "2" }),
  });
  expect(mockOrdenados).toHaveBeenCalledWith({
    gender: "WOMAN",
    city: "Lima",
    service: undefined,
    search: "sofia",
    isNew: false,
    page: 2,
  });
});

it("?isNew=true activa el filtro; combina con otros filtros", async () => {
  await ModelosPage({
    searchParams: Promise.resolve({ city: "Lima", isNew: "true" }),
  });
  expect(mockOrdenados).toHaveBeenCalledWith(
    expect.objectContaining({ city: "Lima", isNew: true }),
  );
});

it("isNew con cualquier otro valor no activa el filtro", async () => {
  await ModelosPage({ searchParams: Promise.resolve({ isNew: "1" }) });
  expect(mockOrdenados).toHaveBeenCalledWith(expect.objectContaining({ isNew: false }));
});

it("propaga featuredIds del resultado como set de badges VIP (no lanza)", async () => {
  mockOrdenados.mockResolvedValue({ ...emptyResult, featuredIds: ["t1", "t2"] });
  await expect(ModelosPage({ searchParams: Promise.resolve({}) })).resolves.toBeTruthy();
});
