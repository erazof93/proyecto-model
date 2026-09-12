import fs from "fs";
import path from "path";
import { CRUD_AUDIT } from "../crud-audit";

const APP_ROOT = path.resolve(__dirname, "..", "..", "..");

/** Todas las entradas {method, path, file} declaradas en el audit, aplanadas. */
function allOps() {
  return Object.entries(CRUD_AUDIT).flatMap(([resource, ops]) =>
    (
      [
        ["create", ops.create],
        ["update", ops.update],
        ["delete", ops.delete],
        ...ops.read.map((op, i) => [`read[${i}]`, op] as const),
      ] as const
    ).map(([kind, op]) => ({ resource, kind, op })),
  );
}

describe("CRUD audit — coherencia con el código real", () => {
  it.each(allOps().filter((o) => o.op.file))(
    "$resource.$kind: $op.file expone $op.method en $op.path",
    ({ op }) => {
      const filePath = path.join(APP_ROOT, op.file as string);
      expect(fs.existsSync(filePath)).toBe(true);

      const source = fs.readFileSync(filePath, "utf8");
      const exportsMethod = new RegExp(`export\\s+async function\\s+${op.method}\\b`).test(source);
      expect(exportsMethod).toBe(true);
    },
  );

  it.each(allOps().filter((o) => o.op.path === null))(
    "$resource.$kind: operación declarada como faltante trae una nota",
    ({ op }) => {
      expect(op.method).toBeNull();
      expect(op.note).toBeTruthy();
    },
  );

  it("cubre los seis recursos auditados", () => {
    expect(Object.keys(CRUD_AUDIT).sort()).toEqual(
      ["checklists", "featured", "models", "photos", "reviews", "users"].sort(),
    );
  });
});
