import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { ModelCarousel } from "../ModelCarousel";

const mk = (id: string) =>
  ({
    id,
    slug: `${id}-lima`,
    name: `Modelo ${id}`,
    age: 24,
    gender: "WOMAN",
    city: "Lima",
    services: [],
  }) as unknown as React.ComponentProps<typeof ModelCarousel>["models"][number];

const models = [mk("a"), mk("b"), mk("c")];

beforeEach(() => {
  Element.prototype.scrollBy = jest.fn(); // jsdom no lo implementa
  Element.prototype.scrollTo = jest.fn();
  window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});
afterEach(() => jest.restoreAllMocks());

describe("ModelCarousel", () => {
  it("renderiza una card por modelo", () => {
    render(<ModelCarousel models={models} />);
    expect(screen.getByTestId("model-card-a-lima")).toBeInTheDocument();
    expect(screen.getByTestId("model-card-c-lima")).toBeInTheDocument();
  });

  it("pinta el badge VIP solo en los ids de featuredIds", () => {
    render(<ModelCarousel models={models} featuredIds={["b"]} />);
    expect(screen.getAllByLabelText("Modelo destacada VIP")).toHaveLength(1);
  });

  it("es un carrusel horizontal en todos los tamaños (no grid en md)", () => {
    const { container } = render(<ModelCarousel models={models} />);
    const track = container.querySelector(".snap-x") as HTMLElement;
    expect(track.className).toMatch(/\bflex\b/);
    expect(track.className).not.toMatch(/md:grid/);
    const item = track.firstElementChild as HTMLElement;
    expect(item.className).toContain("w-[78%]");
    expect(item.className).toContain("lg:w-1/4");
  });

  it("flechas Anterior/Siguiente presentes; 'Anterior' arranca deshabilitada", () => {
    render(<ModelCarousel models={models} />);
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeInTheDocument();
  });

  it("sin autoplay muestra la pista 'Desliza para ver más' y no auto-desliza", () => {
    jest.useFakeTimers();
    render(<ModelCarousel models={models} />);
    expect(screen.getByText("Desliza para ver más")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(20000));
    expect(Element.prototype.scrollBy).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("con autoplay auto-desliza cada intervalo y lo indica en la pista", () => {
    jest.useFakeTimers();
    render(<ModelCarousel models={models} autoplay autoplayInterval={5000} />);
    expect(screen.getByText("Deslizando solo")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(5000));
    // en jsdom scrollWidth/clientWidth son 0 → "está al final" → scrollTo(0)
    expect(
      (Element.prototype.scrollTo as jest.Mock).mock.calls.length +
        (Element.prototype.scrollBy as jest.Mock).mock.calls.length,
    ).toBeGreaterThan(0);
    jest.useRealTimers();
  });

  it("autoplay se pausa al pasar el ratón por encima", () => {
    jest.useFakeTimers();
    const { container } = render(
      <ModelCarousel models={models} autoplay autoplayInterval={5000} />,
    );
    fireEvent.mouseEnter(container.firstChild as Element);
    expect(screen.getByText("En pausa")).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(15000));
    expect(Element.prototype.scrollTo).not.toHaveBeenCalled();
    expect(Element.prototype.scrollBy).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("respeta prefers-reduced-motion (no auto-desliza)", () => {
    (window.matchMedia as jest.Mock).mockReturnValue({ matches: true });
    jest.useFakeTimers();
    render(<ModelCarousel models={models} autoplay autoplayInterval={5000} />);
    act(() => jest.advanceTimersByTime(15000));
    expect(Element.prototype.scrollTo).not.toHaveBeenCalled();
    expect(Element.prototype.scrollBy).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});
