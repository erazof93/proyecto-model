import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { FilterDrawer } from "../FilterDrawer";

const push = jest.fn();
let currentParams = new URLSearchParams();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => currentParams,
}));

const options = {
  cities: ["Lima", "Callao"],
  genders: ["WOMAN", "MAN"],
  services: ["Masaje", "Sesión fotos"],
};

beforeEach(() => {
  push.mockClear();
  currentParams = new URLSearchParams();
  document.body.style.overflow = "";
});

const openDrawer = () => {
  fireEvent.click(screen.getByRole("button", { name: "Filtros" }));
  return screen.getByTestId("filter-drawer-panel");
};

describe("FilterDrawer", () => {
  it("el trigger no muestra el panel hasta el click", () => {
    render(<FilterDrawer options={options} />);
    expect(screen.getByTestId("filter-drawer-panel")).toHaveAttribute("aria-hidden", "true");
  });

  it("al abrir muestra todos los filtros y bloquea el scroll de fondo", () => {
    render(<FilterDrawer options={options} />);
    const dialog = openDrawer();

    expect(dialog).toHaveAttribute("aria-hidden", "false");
    expect(within(dialog).getByLabelText("Mujer")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Hombre")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Trans")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Ciudad")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Servicio")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Tipo")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Solo nuevas integrantes")).toBeInTheDocument();
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("Mujer va preseleccionado cuando la URL no trae género", () => {
    render(<FilterDrawer options={options} />);
    const dialog = openDrawer();
    expect(within(dialog).getByLabelText("Mujer")).toBeChecked();
  });

  it("refleja los filtros que ya vienen en la URL al abrir", () => {
    currentParams = new URLSearchParams("gender=MAN&city=Callao&type=TOP&isNew=true");
    render(<FilterDrawer options={options} />);
    const dialog = openDrawer();

    expect(within(dialog).getByLabelText("Hombre")).toBeChecked();
    expect(within(dialog).getByLabelText("Ciudad")).toHaveValue("Callao");
    expect(within(dialog).getByLabelText("Tipo")).toHaveValue("TOP");
    expect(within(dialog).getByLabelText("Solo nuevas integrantes")).toBeChecked();
  });

  it("Aplicar navega a /modelos con los filtros elegidos y sin ?page", () => {
    currentParams = new URLSearchParams("page=3");
    render(<FilterDrawer options={options} />);
    const dialog = openDrawer();

    fireEvent.click(within(dialog).getByLabelText("Hombre"));
    fireEvent.change(within(dialog).getByLabelText("Ciudad"), { target: { value: "Lima" } });
    fireEvent.change(within(dialog).getByLabelText("Servicio"), { target: { value: "Masaje" } });
    fireEvent.change(within(dialog).getByLabelText("Tipo"), { target: { value: "TOP" } });
    fireEvent.click(within(dialog).getByLabelText("Solo nuevas integrantes"));
    fireEvent.click(within(dialog).getByRole("button", { name: "Aplicar" }));

    expect(push).toHaveBeenCalledTimes(1);
    const url = new URL(push.mock.calls[0][0], "http://x");
    expect(url.pathname).toBe("/modelos");
    expect(url.searchParams.get("gender")).toBe("MAN");
    expect(url.searchParams.get("city")).toBe("Lima");
    expect(url.searchParams.get("service")).toBe("Masaje");
    expect(url.searchParams.get("type")).toBe("TOP");
    expect(url.searchParams.get("isNew")).toBe("true");
    expect(url.searchParams.has("page")).toBe(false);
    expect(dialog).toHaveAttribute("aria-hidden", "true");
  });

  it("Limpiar resetea y navega a /modelos sin parámetros", () => {
    currentParams = new URLSearchParams("gender=MAN&city=Lima&isNew=true");
    render(<FilterDrawer options={options} />);
    const dialog = openDrawer();

    fireEvent.click(within(dialog).getByRole("button", { name: "Limpiar" }));

    expect(push).toHaveBeenCalledWith("/modelos");
    expect(dialog).toHaveAttribute("aria-hidden", "true");
  });

  it("la ✕ cierra el panel sin navegar y libera el scroll", () => {
    render(<FilterDrawer options={options} />);
    const dialog = openDrawer();

    fireEvent.click(within(dialog).getByRole("button", { name: "Cerrar" }));

    expect(dialog).toHaveAttribute("aria-hidden", "true");
    expect(push).not.toHaveBeenCalled();
    expect(document.body.style.overflow).toBe("");
  });

  it("Escape cierra el panel", () => {
    render(<FilterDrawer options={options} />);
    const dialog = openDrawer();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(dialog).toHaveAttribute("aria-hidden", "true");
  });
});
