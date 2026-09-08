/**
 * @jest-environment node
 *
 * Igual que queries.test.ts: mockeamos ../data-source y afirmamos sobre las
 * llamadas al repositorio (nunca sobre SQL en crudo).
 */

const mockRepo = {
  find: jest.fn().mockResolvedValue([]),
  findOne: jest.fn().mockResolvedValue(null),
  create: jest.fn((x: unknown) => x),
  save: jest.fn(async (x: unknown) => ({ id: "chk-1", ...(x as object) })),
  update: jest.fn().mockResolvedValue({ affected: 1 }),
  delete: jest.fn().mockResolvedValue({ affected: 1 }),
};

jest.mock("../data-source", () => ({
  getRepo: jest.fn(async () => mockRepo),
}));

import {
  createChecklist,
  deleteChecklist,
  listActiveChecklists,
  listChecklists,
  updateChecklist,
} from "../checklists";

beforeEach(() => {
  jest.clearAllMocks();
  mockRepo.find.mockResolvedValue([]);
  mockRepo.findOne.mockResolvedValue(null);
  mockRepo.update.mockResolvedValue({ affected: 1 });
  mockRepo.delete.mockResolvedValue({ affected: 1 });
});

describe("listChecklists / listActiveChecklists", () => {
  it("listChecklists trae todos, orden por created_at DESC", async () => {
    await listChecklists();
    expect(mockRepo.find).toHaveBeenCalledWith({ order: { created_at: "DESC" } });
  });

  it("listActiveChecklists filtra is_active y ordena por nombre", async () => {
    await listActiveChecklists();
    expect(mockRepo.find).toHaveBeenCalledWith({
      where: { is_active: true },
      order: { name: "ASC" },
    });
  });
});

describe("createChecklist", () => {
  it("recorta el nombre y aplica is_active=true por defecto", async () => {
    await createChecklist({ name: "  Masaje  " });
    expect(mockRepo.create).toHaveBeenCalledWith({
      name: "Masaje",
      description: null,
      is_active: true,
    });
  });

  it("respeta is_active=false y usa la descripción dada", async () => {
    await createChecklist({ name: "X", description: " algo ", is_active: false });
    expect(mockRepo.create).toHaveBeenCalledWith({
      name: "X",
      description: "algo",
      is_active: false,
    });
  });
});

describe("updateChecklist", () => {
  it("no llama a update si el patch queda vacío", async () => {
    await updateChecklist("id-1", {});
    expect(mockRepo.update).not.toHaveBeenCalled();
    expect(mockRepo.findOne).toHaveBeenCalledWith({ where: { id: "id-1" } });
  });

  it("aplica solo los campos definidos (name recortado)", async () => {
    mockRepo.findOne.mockResolvedValue({ id: "id-1", name: "Nuevo" });
    await updateChecklist("id-1", { name: "  Nuevo  ", is_active: false });
    expect(mockRepo.update).toHaveBeenCalledWith(
      { id: "id-1" },
      { name: "Nuevo", is_active: false },
    );
  });

  it("permite poner description a null explícitamente", async () => {
    await updateChecklist("id-1", { description: null });
    expect(mockRepo.update).toHaveBeenCalledWith({ id: "id-1" }, { description: null });
  });

  it("devuelve null cuando el id no existe", async () => {
    mockRepo.findOne.mockResolvedValue(null);
    expect(await updateChecklist("nope", { name: "x" })).toBeNull();
  });
});

describe("deleteChecklist", () => {
  it("devuelve true cuando borra una fila", async () => {
    mockRepo.delete.mockResolvedValue({ affected: 1 });
    expect(await deleteChecklist("id-1")).toBe(true);
  });

  it("devuelve false cuando no había nada que borrar", async () => {
    mockRepo.delete.mockResolvedValue({ affected: 0 });
    expect(await deleteChecklist("nope")).toBe(false);
  });
});
