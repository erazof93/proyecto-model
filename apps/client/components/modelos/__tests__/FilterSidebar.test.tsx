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

  it("traduce los códigos de género y los ofrece como opciones de la BD", () => {
    render(<FilterSidebar options={options} />);
    expect(screen.getByLabelText("Mujer")).toHaveAttribute("value", "WOMAN");
    expect(screen.getByLabelText("Hombre")).toHaveAttribute("value", "MAN");
  });

  it("ofrece 'Todos' con valor vacío en género y servicio", () => {
    render(<FilterSidebar options={options} />);
    expect(todoFor("service")?.value).toBe("");
    expect(todoFor("gender")?.value).toBe("");
  });

  it("marca 'Todos' por defecto cuando no hay filtro activo", () => {
    render(<FilterSidebar current={{}} options={options} />);
    expect(todoFor("service")).toBeChecked();
    expect(todoFor("gender")).toBeChecked();
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
});
