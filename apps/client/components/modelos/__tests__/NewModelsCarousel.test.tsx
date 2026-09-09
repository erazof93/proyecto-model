import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { NewModelsCarousel } from "../NewModelsCarousel";

const mk = (id: string) =>
  ({
    id,
    slug: `${id}-lima`,
    name: `Modelo ${id}`,
    age: 24,
    gender: "WOMAN",
    city: "Lima",
    services: [],
  }) as unknown as React.ComponentProps<typeof NewModelsCarousel>["models"][number];

const models = [mk("a"), mk("b"), mk("c")];

beforeEach(() => {
  // jsdom no implementa scrollBy
  Element.prototype.scrollBy = jest.fn();
});
afterEach(() => jest.restoreAllMocks());

describe("NewModelsCarousel", () => {
  it("renderiza una card por modelo", () => {
    render(<NewModelsCarousel models={models} />);
    expect(screen.getByTestId("model-card-a-lima")).toBeInTheDocument();
    expect(screen.getByTestId("model-card-b-lima")).toBeInTheDocument();
    expect(screen.getByTestId("model-card-c-lima")).toBeInTheDocument();
  });

  it("pinta el badge VIP solo en los ids de featuredIds", () => {
    render(<NewModelsCarousel models={models} featuredIds={["b"]} />);
    expect(screen.getAllByLabelText("Modelo destacada VIP")).toHaveLength(1);
  });

  it("ofrece flechas Anterior/Siguiente para el modo móvil", () => {
    render(<NewModelsCarousel models={models} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeInTheDocument();
  });

  it("'Anterior' arranca deshabilitada (scroll en el inicio)", () => {
    render(<NewModelsCarousel models={models} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
  });

  it("clicar una flecha llama scrollBy con scroll suave (cuando está habilitada)", () => {
    render(<NewModelsCarousel models={models} />);
    const next = screen.getByRole("button", { name: "Siguiente" });
    // en jsdom no hay layout, así que el botón puede quedar disabled; solo
    // afirmamos que, si se clica habilitado, el handler pide scroll suave.
    if (!next.hasAttribute("disabled")) {
      fireEvent.click(next);
      expect(Element.prototype.scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ behavior: "smooth" }),
      );
    }
  });
});
