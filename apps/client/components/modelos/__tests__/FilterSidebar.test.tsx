import React from "react";
import { render, screen } from "@testing-library/react";
import { FilterSidebar } from "../FilterSidebar";

const options = {
  cities: ["Lima", "Callao"],
  genders: ["WOMAN", "MAN"],
  services: ["Sesión fotos", "Modelaje eventos"],
};

/** El radio "Todos" de un grupo concreto (gender / service). */
const todoFor = (name: string) =>
  screen.getAllByLabelText("Todos").find((el) => el.getAttribute("name") === name) as
    | HTMLInputElement
    | undefined;

describe("FilterSidebar", () => {
  it("renderiza las opciones de servicio que llegan por props (no hardcodeadas)", () => {
    render(<FilterSidebar options={options} />);
    expect(screen.getByLabelText("Sesión fotos")).toHaveAttribute("name", "service");
    expect(screen.getByLabelText("Modelaje eventos")).toBeInTheDocument();
  });

  it("no renderiza el grupo de género (se controla desde el Header)", () => {
    const { container } = render(<FilterSidebar options={options} />);
    expect(screen.queryByLabelText("Mujer")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Hombre")).not.toBeInTheDocument();
    expect(container.querySelectorAll('input[name="gender"]:not([type="hidden"])')).toHaveLength(0);
  });

  it("arrastra el género activo como campo oculto para no perderlo al aplicar", () => {
    const { container } = render(<FilterSidebar current={{ gender: "MAN" }} options={options} />);
    const hidden = container.querySelector('input[name="gender"]') as HTMLInputElement;
    expect(hidden.type).toBe("hidden");
    expect(hidden.value).toBe("MAN");
  });

  it("el campo oculto de género queda vacío cuando no hay género activo", () => {
    const { container } = render(<FilterSidebar current={{}} options={options} />);
    expect((container.querySelector('input[name="gender"]') as HTMLInputElement).value).toBe("");
  });

  it("ofrece 'Todos' con valor vacío en servicio", () => {
    render(<FilterSidebar options={options} />);
    expect(todoFor("service")?.value).toBe("");
  });

  it("marca 'Todos' por defecto cuando no hay filtro activo", () => {
    render(<FilterSidebar current={{}} options={options} />);
    expect(todoFor("service")).toBeChecked();
  });

  it("marca el servicio activo y desmarca su 'Todos' cuando hay filtro", () => {
    render(<FilterSidebar current={{ service: "Sesión fotos" }} options={options} />);
    expect(todoFor("service")).not.toBeChecked();
    expect(screen.getByLabelText("Sesión fotos")).toBeChecked();
  });

  it("no revienta sin options (degradación: solo muestra 'Todos')", () => {
    render(<FilterSidebar />);
    expect(todoFor("service")).toBeChecked();
    expect(screen.queryByLabelText("Sesión fotos")).not.toBeInTheDocument();
  });

  describe("filtro 'Tipo' (Solo VIP)", () => {
    it("ofrece 'Todas las modelos' (default) y 'Solo VIP destacadas' con valor TOP", () => {
      render(<FilterSidebar options={options} />);
      const sel = screen.getByLabelText("Tipo") as HTMLSelectElement;
      expect(sel.name).toBe("type");
      expect(sel.value).toBe("");
      expect(screen.getByRole("option", { name: "Solo VIP destacadas" })).toHaveValue("TOP");
    });

    it("queda en 'Solo VIP' cuando current.type es 'TOP'", () => {
      render(<FilterSidebar current={{ type: "TOP" }} options={options} />);
      expect((screen.getByLabelText("Tipo") as HTMLSelectElement).value).toBe("TOP");
    });
  });

  describe("checkbox 'Solo nuevas integrantes'", () => {
    it("es un checkbox name=isNew value=true, desmarcado por defecto", () => {
      render(<FilterSidebar options={options} />);
      const cb = screen.getByLabelText("Solo nuevas integrantes") as HTMLInputElement;
      expect(cb).toHaveAttribute("name", "isNew");
      expect(cb).toHaveAttribute("value", "true");
      expect(cb.type).toBe("checkbox");
      expect(cb).not.toBeChecked();
    });

    it("queda marcado cuando current.isNew es true", () => {
      render(<FilterSidebar current={{ isNew: true }} options={options} />);
      expect(screen.getByLabelText("Solo nuevas integrantes")).toBeChecked();
    });
  });
});
