import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CreateFeaturedDialog } from "../CreateFeaturedDialog";

const models = [
  { id: "m1", name: "Sofía", username: "sofia_lima" },
  { id: "m2", name: "Valentina", username: "valentina_lima" },
];

beforeEach(() => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch;
});
afterEach(() => jest.restoreAllMocks());

it("no renderiza nada cuando open=false", () => {
  const { container } = render(
    <CreateFeaturedDialog open={false} models={models} onClose={jest.fn()} onCreated={jest.fn()} />,
  );
  expect(container).toBeEmptyDOMElement();
});

it("preselecciona y bloquea el modelo cuando se pasa defaultModelId", () => {
  render(
    <CreateFeaturedDialog
      open
      models={models}
      defaultModelId="m2"
      onClose={jest.fn()}
      onCreated={jest.fn()}
    />,
  );
  const select = screen.getByRole("combobox") as HTMLSelectElement;
  expect(select.value).toBe("m2");
  expect(select).toBeDisabled();
});

it("crea el destacado con el plan por defecto (BANNER) — POST a /api/admin/featured", async () => {
  const onCreated = jest.fn();
  const onClose = jest.fn();
  render(
    <CreateFeaturedDialog
      open
      models={models}
      defaultModelId="m1"
      onClose={onClose}
      onCreated={onCreated}
    />,
  );

  fireEvent.click(screen.getByRole("button", { name: "Crear destacado" }));

  await waitFor(() => expect(onCreated).toHaveBeenCalled());
  expect(global.fetch).toHaveBeenCalledWith(
    "/api/admin/featured",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ modelId: "m1", type: "BANNER", price: 75, durationDays: 7 }),
    }),
  );
  expect(onClose).toHaveBeenCalled();
});

it("permite elegir el plan TOP", async () => {
  render(
    <CreateFeaturedDialog
      open
      models={models}
      defaultModelId="m1"
      onClose={jest.fn()}
      onCreated={jest.fn()}
    />,
  );

  fireEvent.click(screen.getByRole("radio", { name: /TOP Lista/ }));
  fireEvent.click(screen.getByRole("button", { name: "Crear destacado" }));

  await waitFor(() =>
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/admin/featured",
      expect.objectContaining({
        body: JSON.stringify({ modelId: "m1", type: "TOP", price: 50, durationDays: 7 }),
      }),
    ),
  );
});

it("valida que haya un modelo seleccionado", () => {
  render(<CreateFeaturedDialog open models={models} onClose={jest.fn()} onCreated={jest.fn()} />);
  fireEvent.click(screen.getByRole("button", { name: "Crear destacado" }));
  expect(screen.getByText("Selecciona un modelo")).toBeInTheDocument();
  expect(global.fetch).not.toHaveBeenCalled();
});
