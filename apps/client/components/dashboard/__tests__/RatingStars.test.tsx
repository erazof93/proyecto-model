import React from "react";
import { render } from "@testing-library/react";
import { RatingStars } from "../RatingStars";

// El componente real usa el icono <Star> de lucide-react (SVGs), no
// caracteres "★" literales, así que se cuentan <svg> en vez de texto.
describe("RatingStars", () => {
  it("renders exactly 5 stars", () => {
    const { container } = render(<RatingStars rating={3} />);
    expect(container.querySelectorAll("svg")).toHaveLength(5);
  });

  it("fills stars up to the rounded rating", () => {
    const { container } = render(<RatingStars rating={3.5} />);
    const filled = container.querySelectorAll("svg.fill-amber-400");
    // Math.round(3.5) === 4
    expect(filled).toHaveLength(4);
  });

  it("leaves the remaining stars unfilled", () => {
    const { container } = render(<RatingStars rating={2} />);
    const empty = container.querySelectorAll("svg.text-border:not(.fill-amber-400)");
    expect(empty).toHaveLength(3);
  });

  it("defaults to the md size", () => {
    const { container } = render(<RatingStars rating={4} />);
    expect(container.querySelector("svg")).toHaveClass("h-5", "w-5");
  });

  it("supports the sm and lg sizes", () => {
    const { container: small } = render(<RatingStars rating={4} size="sm" />);
    expect(small.querySelector("svg")).toHaveClass("h-4", "w-4");

    const { container: large } = render(<RatingStars rating={4} size="lg" />);
    expect(large.querySelector("svg")).toHaveClass("h-6", "w-6");
  });
});
