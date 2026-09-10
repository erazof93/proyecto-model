import React from "react";
import { render, screen } from "@testing-library/react";
import { ModelGrid } from "../ModelGrid";

const mk = (id: string, slug: string) =>
  ({
    id,
    slug,
    name: `Modelo ${id}`,
    age: 25,
    gender: "WOMAN",
    city: "Lima",
    services: [],
  }) as unknown as React.ComponentProps<typeof ModelGrid>["models"][number];

describe("ModelGrid", () => {
  it("muestra el estado vacío sin modelos", () => {
    render(<ModelGrid models={[]} />);
    expect(screen.getByText("No se encontraron modelos.")).toBeInTheDocument();
  });

  it("pinta el badge VIP solo en las cards cuyo id está en featuredIds", () => {
    const models = [mk("a", "a-lima"), mk("b", "b-lima"), mk("c", "c-lima")];
    render(<ModelGrid models={models} featuredIds={new Set(["b"])} />);
    expect(screen.getAllByLabelText("Modelo destacada VIP")).toHaveLength(1);
  });

  it("sin featuredIds no pinta ningún badge", () => {
    render(<ModelGrid models={[mk("a", "a-lima"), mk("b", "b-lima")]} />);
    expect(screen.queryByLabelText("Modelo destacada VIP")).not.toBeInTheDocument();
  });

  it("usa un grid responsivo 2→3→4 columnas con gap adaptativo", () => {
    const { container } = render(<ModelGrid models={[mk("a", "a-lima")]} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass("grid-cols-2", "md:grid-cols-3", "lg:grid-cols-4");
    expect(grid).toHaveClass("gap-4", "md:gap-6");
  });

  it("permite sobreescribir clases vía className", () => {
    const { container } = render(
      <ModelGrid models={[mk("a", "a-lima")]} className="xl:grid-cols-6" />,
    );
    expect(container.firstChild).toHaveClass("xl:grid-cols-6", "grid-cols-2");
  });

  it("propaga cardVariant a las cards (wide → 16:9)", () => {
    const { container } = render(
      <ModelGrid models={[mk("a", "a-lima")]} cardVariant="wide" />,
    );
    expect(container.querySelector("[class*='aspect-video']")).toBeInTheDocument();
  });

  it("propaga cardImageAspectRatio a las cards", () => {
    const { container } = render(
      <ModelGrid
        models={[mk("a", "a-lima")]}
        cardImageAspectRatio="h-56 md:aspect-square"
      />,
    );
    expect(container.querySelector(".h-56")).toBeInTheDocument();
    expect(container.querySelector("[class*='aspect-\\[3\\/4\\]']")).not.toBeInTheDocument();
  });

  it("sin cardImageAspectRatio las cards usan la proporción 3:4 por defecto (igual HOME)", () => {
    const { container } = render(<ModelGrid models={[mk("a", "a-lima")]} />);
    expect(container.querySelector("[class*='aspect-\\[3\\/4\\]']")).toBeInTheDocument();
    expect(container.querySelector(".h-56")).not.toBeInTheDocument();
  });
});
