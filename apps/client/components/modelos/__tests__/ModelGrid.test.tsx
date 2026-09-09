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
});
