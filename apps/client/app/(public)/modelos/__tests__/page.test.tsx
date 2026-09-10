/**
 * El listado público /modelos: con ?q usa getModelosBySearch (match combinado
 * nombre + username + ciudad + servicios); sin ?q usa getModelosOrdenados
 * (5 tramos + rotación). Tampoco debe caer entero si la BD falla.
 */

jest.mock("@/components/modelos/FilterSidebar", () => ({ FilterSidebar: () => null }));
jest.mock("@/components/modelos/ModelGrid", () => ({ ModelGrid: () => null }));
jest.mock("@/components/modelos/Pagination", () => ({ Pagination: () => null }));
jest.mock("@/components/ui/Logo", () => ({ Logo: () => null }));
jest.mock("@/lib/db/queries", () => ({
  getModelosOrdenados: jest.fn(),
  getModelosBySearch: jest.fn(),
  getFilterOptions: jest.fn(),
}));

import ModelosPage from "../page";
import {
  getFilterOptions,
  getModelosBySearch,
  getModelosOrdenados,
} from "@/lib/db/queries";

const mockOrdenados = getModelosOrdenados as jest.Mock;
const mockBySearch = getModelosBySearch as jest.Mock;
const mockFilterOptions = getFilterOptions as jest.Mock;

const emptyResult = { data: [], page: 1, pageSize: 20, total: 0, totalPages: 1, featuredIds: [] };

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockOrdenados.mockResolvedValue(emptyResult);
  mockBySearch.mockResolvedValue([]);
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

it("sin ?q pasa los filtros de searchParams a getModelosOrdenados", async () => {
  await ModelosPage({
    searchParams: Promise.resolve({ gender: "WOMAN", city: "Lima", page: "2" }),
  });
  expect(mockOrdenados).toHaveBeenCalledWith({
    gender: "WOMAN",
    city: "Lima",
    service: undefined,
    isNew: false,
    type: undefined,
    page: 2,
  });
  expect(mockBySearch).not.toHaveBeenCalled();
});

it("con ?q enruta a la búsqueda combinada y no llama a getModelosOrdenados", async () => {
  await ModelosPage({
    searchParams: Promise.resolve({ gender: "WOMAN", city: "Lima", q: "sofia", page: "2" }),
  });
  expect(mockBySearch).toHaveBeenCalledWith("sofia");
  expect(mockOrdenados).not.toHaveBeenCalled();
});

it("?q en blanco (solo espacios) no cuenta como búsqueda", async () => {
  await ModelosPage({ searchParams: Promise.resolve({ q: "   " }) });
  expect(mockBySearch).not.toHaveBeenCalled();
  expect(mockOrdenados).toHaveBeenCalled();
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

it("?type=TOP activa el filtro VIP; combina con otros filtros", async () => {
  await ModelosPage({ searchParams: Promise.resolve({ type: "TOP", city: "Lima" }) });
  expect(mockOrdenados).toHaveBeenCalledWith(
    expect.objectContaining({ type: "TOP", city: "Lima" }),
  );
});

it("?type=BANNER activa el filtro de banners", async () => {
  await ModelosPage({ searchParams: Promise.resolve({ type: "BANNER" }) });
  expect(mockOrdenados).toHaveBeenCalledWith(expect.objectContaining({ type: "BANNER" }));
});

it("type con un valor desconocido se ignora", async () => {
  await ModelosPage({ searchParams: Promise.resolve({ type: "XYZ" }) });
  expect(mockOrdenados).toHaveBeenCalledWith(expect.objectContaining({ type: undefined }));
});

it("propaga featuredIds del resultado como set de badges VIP (no lanza)", async () => {
  mockOrdenados.mockResolvedValue({ ...emptyResult, featuredIds: ["t1", "t2"] });
  await expect(ModelosPage({ searchParams: Promise.resolve({}) })).resolves.toBeTruthy();
});
