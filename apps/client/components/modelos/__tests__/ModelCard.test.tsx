import React from "react";
import { render, screen } from "@testing-library/react";
import { ModelCard } from "../ModelCard";

const model = {
  id: "1",
  name: "Sofía Martínez",
  slug: "sofia-martinez",
  age: 24,
  gender: "WOMAN",
  city: "Lima",
  services: ["Masaje"],
} as unknown as React.ComponentProps<typeof ModelCard>["model"];

describe("ModelCard — badge VIP", () => {
  it("no muestra el badge VIP por defecto", () => {
    render(<ModelCard model={model} />);
    expect(screen.queryByLabelText("Modelo destacada VIP")).not.toBeInTheDocument();
  });

  it("no muestra el badge cuando featured={false}", () => {
    render(<ModelCard model={model} featured={false} />);
    expect(screen.queryByLabelText("Modelo destacada VIP")).not.toBeInTheDocument();
  });

  it("muestra el badge VIP cuando featured", () => {
    render(<ModelCard model={model} featured />);
    expect(screen.getByLabelText("Modelo destacada VIP")).toHaveTextContent("VIP");
  });

  it("sigue enlazando al perfil de la modelo", () => {
    render(<ModelCard model={model} featured />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/modelos/sofia-martinez");
  });
});

describe("ModelCard — proporción del media", () => {
  it("portrait por defecto: 3:4 en móvil y desktop (consistente HOME + /modelos)", () => {
    const { container } = render(<ModelCard model={model} />);
    expect(container.querySelector(".aspect-\\[3\\/4\\]")).toBeInTheDocument();
    expect(container.querySelector(".md\\:aspect-square")).not.toBeInTheDocument();
    expect(container.querySelector(".aspect-video")).not.toBeInTheDocument();
  });

  it("imageAspectRatio sobreescribe la proporción del media en portrait", () => {
    const { container } = render(
      <ModelCard model={model} imageAspectRatio="h-56 md:aspect-square" />,
    );
    expect(container.querySelector(".h-56")).toBeInTheDocument();
    expect(container.querySelector(".md\\:aspect-square")).toBeInTheDocument();
    expect(container.querySelector(".aspect-\\[3\\/4\\]")).not.toBeInTheDocument();
  });

  it("variant='wide': 16:9 (ignora imageAspectRatio)", () => {
    const { container } = render(
      <ModelCard model={model} variant="wide" imageAspectRatio="h-56 md:aspect-square" />,
    );
    expect(container.querySelector(".aspect-video")).toBeInTheDocument();
    expect(container.querySelector(".h-56")).not.toBeInTheDocument();
  });
});

describe("ModelCard — badge Verificada", () => {
  it("no muestra el badge si la modelo no está verificada", () => {
    render(<ModelCard model={{ ...model, is_verified: false }} />);
    expect(screen.queryByLabelText("Modelo verificada")).not.toBeInTheDocument();
  });

  it("muestra el badge verde 'Verificada' cuando is_verified", () => {
    render(<ModelCard model={{ ...model, is_verified: true }} />);
    const badge = screen.getByLabelText("Modelo verificada");
    expect(badge).toHaveTextContent("Verificada");
    expect(badge.className).toContain("bg-emerald-500");
    // esquina inferior derecha
    expect(badge.className).toMatch(/bottom-2/);
    expect(badge.className).toMatch(/right-2/);
  });

  it("VIP + verificada conviven (badges en esquinas distintas)", () => {
    render(<ModelCard model={{ ...model, is_verified: true }} featured />);
    expect(screen.getByLabelText("Modelo destacada VIP").className).toMatch(/top-2/);
    expect(screen.getByLabelText("Modelo verificada").className).toMatch(/bottom-2/);
  });
});
