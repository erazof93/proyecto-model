import React from "react";
import { render, screen } from "@testing-library/react";
import { Badge } from "../Badge";

describe("Badge (admin)", () => {
  it("renders its children", () => {
    render(<Badge>Verificada</Badge>);
    expect(screen.getByText("Verificada")).toBeInTheDocument();
  });

  it("defaults to the neutral variant", () => {
    render(<Badge>Neutral</Badge>);
    expect(screen.getByText("Neutral")).toHaveClass("bg-light_bg");
  });

  it("applies the success tokens for the success variant", () => {
    render(<Badge variant="success">Verificada</Badge>);
    expect(screen.getByText("Verificada")).toHaveClass("bg-success-light", "text-success-dark");
  });

  it("applies the danger tokens for the danger variant", () => {
    render(<Badge variant="danger">Suspendida</Badge>);
    expect(screen.getByText("Suspendida")).toHaveClass("bg-danger-light", "text-danger-dark");
  });
});
