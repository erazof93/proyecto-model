/**
 * La home es pública y NO debe caer entera ("Algo salió mal") si una query a
 * Postgres falla puntualmente (p.ej. (EMAXCONNSESSION) del pooler de Supabase).
 *
 * Carrusel = getFeaturedModelos({ type: "BANNER" }).
 * "Modelos recomendadas" = getModelos({ featuredFirst: true }) paginado de 20 en
 * 20 vía ?page=N; getFeaturedModelos({ type: "TOP" }) da los ids del badge VIP.
 */

import React from "react";
import { render } from "@testing-library/react";

jest.mock("@/components/modelos/SearchFilters", () => ({ SearchFilters: () => null }));
jest.mock("@/components/modelos/FeaturedCarousel", () => ({
  FeaturedCarousel: () => null,
}));
jest.mock("@/components/modelos/ModelGrid", () => ({ ModelGrid: () => null }));
jest.mock("@/components/modelos/ModelCarousel", () => ({
  ModelCarousel: (p: { models: { id: string }[]; autoplay?: boolean }) => (
    <div data-testid={p.autoplay ? "carousel-autoplay" : "carousel"}>{p.models.length}</div>
  ),
}));
jest.mock("@/components/modelos/Pagination", () => ({
  Pagination: (p: { page: number; totalPages: number }) => (
    <nav data-testid="pagination">
      pág {p.page}/{p.totalPages}
    </nav>
  ),
}));
jest.mock("@/lib/db/queries", () => ({
  getFeaturedModelos: jest.fn(),
  getModelos: jest.fn(),
  getFilterOptions: jest.fn(),
  getVipCarousel: jest.fn(),
}));

import HomePage from "../page";
import {
  getFeaturedModelos,
  getFilterOptions,
  getModelos,
  getVipCarousel,
} from "@/lib/db/queries";

const mockFeatured = getFeaturedModelos as jest.Mock;
const mockModelos = getModelos as jest.Mock;
const mockFilterOptions = getFilterOptions as jest.Mock;
const mockVips = getVipCarousel as jest.Mock;

const emptyPage = { data: [], page: 1, pageSize: 20, total: 0, totalPages: 1 };
const home = (sp: Record<string, string | undefined> = {}) =>
  HomePage({ searchParams: Promise.resolve(sp) });

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, "error").mockImplementation(() => {});
  mockFeatured.mockResolvedValue([]);
  mockModelos.mockResolvedValue(emptyPage);
  mockVips.mockResolvedValue([]);
  mockFilterOptions.mockResolvedValue({ cities: [], genders: [], services: [] });
});

afterEach(() => (console.error as jest.Mock).mockRestore?.());

it("degrada a listas vacías (no lanza) cuando la BD falla", async () => {
  const dbDown = new Error("(EMAXCONNSESSION) max clients reached in session mode");
  mockFeatured.mockRejectedValue(dbDown);
  mockModelos.mockRejectedValue(dbDown);

  await expect(home()).resolves.toBeTruthy();
  expect(console.error).toHaveBeenCalledWith(
    expect.stringContaining("[home]"),
    dbDown,
  );
});

it("renderiza normalmente cuando la BD responde", async () => {
  mockFeatured.mockResolvedValue([{ id: "1" }]);
  mockModelos.mockResolvedValue({ ...emptyPage, data: [{ id: "2" }], total: 1, totalPages: 1 });

  await expect(home()).resolves.toBeTruthy();
  expect(console.error).not.toHaveBeenCalled();
});

it("carrusel pide BANNER; badge VIP pide TOP; recomendadas pide 20/página featuredFirst", async () => {
  await home();
  expect(mockFeatured).toHaveBeenCalledWith({ type: "BANNER" });
  expect(mockFeatured).toHaveBeenCalledWith({ type: "TOP" });
  expect(mockModelos).toHaveBeenCalledWith({ pageSize: 20, page: 1, featuredFirst: true });
});

it("la sección 'TOP Destacadas' pide 8 VIP y usa el carrusel con autoplay", async () => {
  mockVips.mockResolvedValue([{ id: "v1" }, { id: "v2" }]);
  const ui = render(await home());
  expect(mockVips).toHaveBeenCalledWith(8);
  expect(ui.getByText("TOP Destacadas")).toBeInTheDocument();
  expect(ui.getByTestId("carousel-autoplay")).toHaveTextContent("2");
  expect(ui.getByText(/rota cada hora/i)).toBeInTheDocument();
  expect(ui.getByRole("link", { name: /Ver todas las VIP/ })).toHaveAttribute(
    "href",
    "/modelos?type=TOP",
  );
});

it("sin VIP no muestra la sección 'TOP Destacadas'", async () => {
  mockVips.mockResolvedValue([]);
  const ui = render(await home());
  expect(ui.queryByText("TOP Destacadas")).not.toBeInTheDocument();
});

it("?page=N pagina 'Modelos recomendadas'", async () => {
  await home({ page: "3" });
  expect(mockModelos).toHaveBeenCalledWith({ pageSize: 20, page: 3, featuredFirst: true });
});

it("'Nuevas integrantes' pide como mucho 8, solo de los últimos 7 días", async () => {
  await home();
  expect(mockModelos).toHaveBeenCalledWith({ pageSize: 8, isNew: true });
});

it("muestra la paginación solo cuando hay más de una página de recomendadas", async () => {
  mockModelos.mockImplementation((f: { isNew?: boolean } = {}) =>
    Promise.resolve(
      f.isNew ? emptyPage : { data: [{ id: "r" }], page: 2, pageSize: 20, total: 40, totalPages: 2 },
    ),
  );
  const ui = render(await home({ page: "2" }));
  expect(ui.getByTestId("pagination")).toHaveTextContent("pág 2/2");
  ui.unmount();

  mockModelos.mockImplementation((f: { isNew?: boolean } = {}) =>
    Promise.resolve(
      f.isNew ? emptyPage : { data: [{ id: "r" }], page: 1, pageSize: 20, total: 5, totalPages: 1 },
    ),
  );
  const ui2 = render(await home());
  expect(ui2.queryByTestId("pagination")).not.toBeInTheDocument();
});

it("muestra 'Ver todas' solo si hay más nuevas que las 8 mostradas", async () => {
  const nuevasPage = (count: number, total: number) => ({
    data: Array.from({ length: count }, (_, i) => ({ id: `n${i}` })),
    page: 1,
    pageSize: 8,
    total,
    totalPages: 1,
  });

  mockModelos.mockImplementation((f: { isNew?: boolean } = {}) =>
    Promise.resolve(f.isNew ? nuevasPage(2, 2) : emptyPage),
  );
  let ui = render(await home());
  expect(ui.queryByText(/Ver todas/)).not.toBeInTheDocument();
  ui.unmount();

  mockModelos.mockImplementation((f: { isNew?: boolean } = {}) =>
    Promise.resolve(f.isNew ? nuevasPage(8, 15) : emptyPage),
  );
  ui = render(await home());
  expect(ui.getByRole("link", { name: /Ver todas/ })).toHaveAttribute("href", "/modelos");
});
