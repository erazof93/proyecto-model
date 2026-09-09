import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ContactButtons } from "../ContactButtons";

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true }) as unknown as typeof fetch;
  window.open = jest.fn();
});
afterEach(() => jest.restoreAllMocks());

const base = {
  modelId: "m1",
  whatsapp: "+51 987 654 321",
  instagram: "@sofia.model",
  tiktok: null,
  telegram: null,
};

it("click en WhatsApp: registra WHATSAPP_CLICK y abre wa.me con solo dígitos", () => {
  render(<ContactButtons {...base} />);
  fireEvent.click(screen.getByRole("button", { name: /WhatsApp/ }));

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/modelos/interactions",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ model_id: "m1", interaction_type: "WHATSAPP_CLICK" }),
    }),
  );
  expect(window.open).toHaveBeenCalledWith(
    "https://wa.me/51987654321",
    "_blank",
    "noopener,noreferrer",
  );
});

it("click en Instagram: registra INSTAGRAM_CLICK y normaliza el handle", () => {
  render(<ContactButtons {...base} />);
  fireEvent.click(screen.getByRole("button", { name: /Instagram/ }));

  expect(global.fetch).toHaveBeenCalledWith(
    "/api/modelos/interactions",
    expect.objectContaining({
      body: JSON.stringify({ model_id: "m1", interaction_type: "INSTAGRAM_CLICK" }),
    }),
  );
  expect(window.open).toHaveBeenCalledWith(
    "https://instagram.com/sofia.model",
    "_blank",
    "noopener,noreferrer",
  );
});

it("deshabilita los canales sin dato y no registra nada al clicarlos", () => {
  render(<ContactButtons {...base} />);
  const tiktok = screen.getByRole("button", { name: /TikTok/ });
  expect(tiktok).toBeDisabled();
  fireEvent.click(tiktok);
  expect(global.fetch).not.toHaveBeenCalled();
  expect(window.open).not.toHaveBeenCalled();
});
