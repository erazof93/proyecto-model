/**
 * @jest-environment node
 */

jest.mock("@/lib/auth/session", () => ({ getSession: jest.fn() }));
jest.mock("@/lib/db/photos", () => ({
  addModelPhoto: jest.fn(),
  deleteModelPhoto: jest.fn(),
  getModelPhotosByType: jest.fn(),
}));
jest.mock("@/lib/storage/supabase-storage", () => ({
  uploadImageBuffer: jest.fn(),
  deletePhoto: jest.fn(),
}));
jest.mock("@/lib/images/process", () => ({
  processImage: jest.fn(),
}));

import { POST } from "../route";
import { getSession } from "@/lib/auth/session";
import {
  addModelPhoto,
  deleteModelPhoto,
  getModelPhotosByType,
} from "@/lib/db/photos";
import { deletePhoto, uploadImageBuffer } from "@/lib/storage/supabase-storage";
import { processImage } from "@/lib/images/process";

const mockSession = getSession as jest.Mock;
const mockAdd = addModelPhoto as jest.Mock;
const mockDeleteRow = deleteModelPhoto as jest.Mock;
const mockGetByType = getModelPhotosByType as jest.Mock;
const mockUpload = uploadImageBuffer as jest.Mock;
const mockDeleteObj = deletePhoto as jest.Mock;
const mockProcess = processImage as jest.Mock;

function jpeg(name = "foto.jpg", bytes = 2048, type = "image/jpeg") {
  return new File([new Uint8Array(bytes)], name, { type });
}

function request(form: FormData) {
  return new Request("http://localhost:3000/api/modelos/fotos/upload", {
    method: "POST",
    body: form,
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSession.mockResolvedValue({ sub: "u1", role: "model", modelId: "model-123" });
  mockGetByType.mockResolvedValue([]);
  mockProcess.mockResolvedValue({
    buffer: Buffer.from("processed"),
    width: 600,
    height: 800,
    bytes: 123_000,
    quality: 64,
    cropped: false,
  });
  mockUpload.mockResolvedValue({
    path: "model-123/abc.jpg",
    url: "https://cdn/model-123/abc.jpg",
  });
  mockAdd.mockResolvedValue({ id: "photo-1" });
  mockDeleteObj.mockResolvedValue(undefined);
  mockDeleteRow.mockResolvedValue(undefined);
});

describe("POST /api/modelos/fotos/upload", () => {
  it("responde 401 sin sesión de modelo", async () => {
    mockSession.mockResolvedValue(null);
    const form = new FormData();
    form.append("photos", jpeg());
    const res = await POST(request(form));
    expect(res.status).toBe(401);
    expect(mockProcess).not.toHaveBeenCalled();
  });

  it("responde 400 si no llega ninguna foto", async () => {
    const res = await POST(request(new FormData()));
    expect(res.status).toBe(400);
  });

  it("responde 400 si se superan las 5 fotos", async () => {
    const form = new FormData();
    for (let i = 0; i < 6; i++) form.append("photos", jpeg(`f${i}.jpg`));
    const res = await POST(request(form));
    expect(res.status).toBe(400);
    expect(mockAdd).not.toHaveBeenCalled();
  });

  it("responde 400 si se mandan 2 banners", async () => {
    const form = new FormData();
    form.append("type", "banner");
    form.append("photos", jpeg("b1.jpg"));
    form.append("photos", jpeg("b2.jpg"));
    const res = await POST(request(form));
    expect(res.status).toBe(400);
  });

  it("procesa, sube y registra una foto de perfil (type=photo por defecto)", async () => {
    const form = new FormData();
    form.append("photos", jpeg("perfil.jpg"));
    const res = await POST(request(form));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.results).toHaveLength(1);
    expect(body.results[0]).toMatchObject({
      success: true,
      url: "https://cdn/model-123/abc.jpg",
      type: "photo",
      bytes: 123_000,
    });
    expect(mockProcess).toHaveBeenCalledWith(expect.any(Buffer), "photo", undefined);
    expect(mockAdd).toHaveBeenCalledWith(
      "model-123",
      "model-123/abc.jpg",
      "https://cdn/model-123/abc.jpg",
      "photo",
    );
  });

  it("usa el modelId de la sesión, nunca uno del FormData", async () => {
    const form = new FormData();
    form.append("model_id", "otro-modelo");
    form.append("photos", jpeg());
    await POST(request(form));
    expect(mockAdd).toHaveBeenCalledWith(
      "model-123",
      expect.any(String),
      expect.any(String),
      "photo",
    );
  });

  it("pasa el recorte crop_<i> parseado a processImage", async () => {
    const form = new FormData();
    form.append("photos", jpeg("a.jpg"));
    form.append("photos", jpeg("b.jpg"));
    form.append("crop_1", JSON.stringify({ left: 10, top: 20, width: 300, height: 400 }));
    await POST(request(form));

    expect(mockProcess).toHaveBeenNthCalledWith(1, expect.any(Buffer), "photo", undefined);
    expect(mockProcess).toHaveBeenNthCalledWith(2, expect.any(Buffer), "photo", {
      left: 10,
      top: 20,
      width: 300,
      height: 400,
    });
  });

  it("ignora un crop_<i> con números inválidos", async () => {
    const form = new FormData();
    form.append("photos", jpeg());
    form.append("crop_0", JSON.stringify({ left: -5, top: 0, width: 10, height: 10 }));
    await POST(request(form));
    expect(mockProcess).toHaveBeenCalledWith(expect.any(Buffer), "photo", undefined);
  });

  it("reemplaza el banner anterior (storage + fila) antes de registrar el nuevo", async () => {
    mockGetByType.mockResolvedValue([
      { id: "old-banner", cloudinary_id: "model-123/old.jpg" },
    ]);
    const form = new FormData();
    form.append("type", "banner");
    form.append("photos", jpeg("nuevo-banner.jpg"));
    const res = await POST(request(form));

    expect(res.status).toBe(201);
    expect(mockGetByType).toHaveBeenCalledWith("model-123", "banner");
    expect(mockDeleteObj).toHaveBeenCalledWith("model-123/old.jpg");
    expect(mockDeleteRow).toHaveBeenCalledWith("old-banner");
    expect(mockProcess).toHaveBeenCalledWith(expect.any(Buffer), "banner", undefined);
    expect(mockAdd).toHaveBeenCalledWith(
      "model-123",
      expect.any(String),
      expect.any(String),
      "banner",
    );
  });

  it("aísla el fallo de un archivo: 201 si al menos uno funciona", async () => {
    const form = new FormData();
    form.append("photos", jpeg("ok.jpg"));
    form.append("photos", jpeg("mala.gif", 2048, "image/gif"));
    const res = await POST(request(form));
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.results[0].success).toBe(true);
    expect(body.results[1].success).toBe(false);
    expect(body.results[1].error).toMatch(/no permitido/i);
  });

  it("responde 422 si TODOS los archivos fallan", async () => {
    const form = new FormData();
    form.append("photos", jpeg("mala.gif", 2048, "image/gif"));
    const res = await POST(request(form));
    expect(res.status).toBe(422);
  });

  it("rechaza un archivo mayor de 5MB", async () => {
    const form = new FormData();
    form.append("photos", jpeg("grande.jpg", 6 * 1024 * 1024));
    const res = await POST(request(form));
    const body = await res.json();
    expect(res.status).toBe(422);
    expect(body.results[0].error).toMatch(/5MB/);
  });
});
