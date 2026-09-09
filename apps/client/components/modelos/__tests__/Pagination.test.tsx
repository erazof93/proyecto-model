import React from "react";
import { render, screen } from "@testing-library/react";
import { Pagination } from "../Pagination";

describe("Pagination", () => {
  it("muestra la página actual y el total", () => {
    render(<Pagination page={2} totalPages={5} />);
    expect(screen.getByText("Página 2 de 5")).toBeInTheDocument();
  });

  it("enlaza 'Retroceder' a la página anterior conservando los filtros", () => {
    render(
      <Pagination page={3} totalPages={5} searchParams={{ gender: "WOMAN", page: "3" }} />,
    );
    const prev = screen.getByRole("link", { name: /Retroceder/ });
    expect(prev).toHaveAttribute("href", "/modelos?gender=WOMAN&page=2");
  });

  it("enlaza 'Siguiente' a la página posterior", () => {
    render(<Pagination page={1} totalPages={3} />);
    expect(screen.getByRole("link", { name: /Siguiente/ })).toHaveAttribute(
      "href",
      "/modelos?page=2",
    );
  });

  it("deshabilita 'Retroceder' en la primera página (no es un enlace)", () => {
    render(<Pagination page={1} totalPages={3} />);
    expect(screen.queryByRole("link", { name: /Retroceder/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Retroceder/)).toBeInTheDocument();
  });

  it("deshabilita 'Siguiente' en la última página (no es un enlace)", () => {
    render(<Pagination page={3} totalPages={3} />);
    expect(screen.queryByRole("link", { name: /Siguiente/ })).not.toBeInTheDocument();
    expect(screen.getByText(/Siguiente/)).toBeInTheDocument();
  });

  it("respeta basePath y hash (uso en la home)", () => {
    render(
      <Pagination
        page={2}
        totalPages={4}
        searchParams={{ page: "2" }}
        basePath="/"
        hash="#recomendadas"
      />,
    );
    expect(screen.getByRole("link", { name: /Retroceder/ })).toHaveAttribute(
      "href",
      "/?page=1#recomendadas",
    );
    expect(screen.getByRole("link", { name: /Siguiente/ })).toHaveAttribute(
      "href",
      "/?page=3#recomendadas",
    );
  });

  it("basePath por defecto sigue siendo /modelos", () => {
    render(<Pagination page={1} totalPages={2} />);
    expect(screen.getByRole("link", { name: /Siguiente/ })).toHaveAttribute(
      "href",
      "/modelos?page=2",
    );
  });
});
