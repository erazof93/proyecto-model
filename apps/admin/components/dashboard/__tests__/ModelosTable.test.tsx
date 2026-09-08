import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ModelosTable } from "../ModelosTable";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => children,
}));

const modelos = [
  {
    id: "m1",
    name: "Sofía",
    username: "sofia_lima",
    gender: "WOMAN",
    age: 23,
    city: "Lima",
    is_verified: true,
  },
  {
    id: "m2",
    name: "Valentina",
    username: "valentina_lima",
    gender: "WOMAN",
    age: 24,
    city: "Callao",
    is_verified: false,
  },
] as unknown as React.ComponentProps<typeof ModelosTable>["initialModelos"];

beforeEach(() => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch;
});
afterEach(() => jest.restoreAllMocks());

it("muestra una fila por modelo", () => {
  render(<ModelosTable initialModelos={modelos} />);
  expect(screen.getByText("Sofía")).toBeInTheDocument();
  expect(screen.getByText("@valentina_lima")).toBeInTheDocument();
});

it("'Destacar' abre el diálogo con el modelo de la fila preseleccionado y bloqueado", () => {
  render(<ModelosTable initialModelos={modelos} />);
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  const botones = screen.getAllByRole("button", { name: "Destacar" });
  fireEvent.click(botones[1]); // fila de Valentina

  expect(screen.getByRole("dialog")).toBeInTheDocument();
  const select = screen.getByRole("combobox") as HTMLSelectElement;
  expect(select.value).toBe("m2");
  expect(select).toBeDisabled();
});

it("cierra el diálogo con Cancelar", () => {
  render(<ModelosTable initialModelos={modelos} />);
  fireEvent.click(screen.getAllByRole("button", { name: "Destacar" })[0]);
  expect(screen.getByRole("dialog")).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
