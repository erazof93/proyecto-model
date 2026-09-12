/**
 * CRUD AUDIT — estado real de las operaciones CRUD por recurso.
 *
 * Generado a partir de los route handlers existentes en `app/api/**` (no es
 * una lista aspiracional). `path: null` marca una operación que hoy NO existe
 * en el backend; `note` explica por qué o cómo se cubre de otra forma.
 *
 * El test asociado (`__tests__/crud-audit.test.ts`) verifica que cada `path`
 * declarado exista de verdad y exponga el método HTTP indicado, así que este
 * archivo se desincroniza (test en rojo) si el código cambia sin actualizarlo.
 */

type Op = {
  method: "GET" | "POST" | "PUT" | "DELETE" | null;
  /** Ruta del endpoint, o `null` si la operación no existe hoy. */
  path: string | null;
  /** Archivo del route handler, relativo a `apps/client/`. */
  file?: string;
  note?: string;
};

export const CRUD_AUDIT: Record<string, { create: Op; read: Op[]; update: Op; delete: Op }> = {
  users: {
    create: { method: "POST", path: "/api/auth/register", file: "app/api/auth/register/route.ts" },
    read: [{ method: "GET", path: "/api/auth/me", file: "app/api/auth/me/route.ts" }],
    update: { method: null, path: null, note: "No existe gestión admin de usuarios (/api/admin/usuarios)." },
    delete: { method: null, path: null, note: "No existe gestión admin de usuarios (/api/admin/usuarios)." },
  },
  models: {
    create: {
      method: null,
      path: null,
      note: "Las modelos se crean vía seed (lib/db/seed.ts), no hay endpoint público de alta.",
    },
    read: [
      { method: "GET", path: "/api/modelos", file: "app/api/modelos/route.ts" },
      { method: "GET", path: "/api/modelos/[slug]", file: "app/api/modelos/[slug]/route.ts" },
    ],
    update: {
      method: "PUT",
      path: "/api/modelos/perfil",
      file: "app/api/modelos/perfil/route.ts",
      note: "Self-service (la modelo edita su propio perfil vía sesión). No hay override admin.",
    },
    delete: { method: null, path: null, note: "No existe borrado de modelos (ni self-service ni admin)." },
  },
  photos: {
    create: {
      method: "POST",
      path: "/api/modelos/fotos/upload",
      file: "app/api/modelos/fotos/upload/route.ts",
    },
    read: [
      {
        method: "GET",
        path: "/api/modelos/fotos",
        file: "app/api/modelos/fotos/route.ts",
        note: "Self-service: fotos de la modelo autenticada, no por id público.",
      },
    ],
    update: {
      method: "PUT",
      path: "/api/modelos/fotos/[id]",
      file: "app/api/modelos/fotos/[id]/route.ts",
      note: "Self-service, no admin.",
    },
    delete: {
      method: "DELETE",
      path: "/api/modelos/fotos/[id]",
      file: "app/api/modelos/fotos/[id]/route.ts",
      note: "Self-service, no admin.",
    },
  },
  featured: {
    create: {
      method: "POST",
      path: "/api/admin/featured-listings",
      file: "app/api/admin/featured-listings/route.ts",
    },
    read: [
      { method: "GET", path: "/api/featured", file: "app/api/featured/route.ts" },
      { method: "GET", path: "/api/featured-vips", file: "app/api/featured-vips/route.ts" },
      {
        method: "GET",
        path: "/api/admin/featured-listings",
        file: "app/api/admin/featured-listings/route.ts",
      },
    ],
    update: {
      method: "PUT",
      path: "/api/admin/featured-listings/[id]",
      file: "app/api/admin/featured-listings/[id]/route.ts",
    },
    delete: {
      method: "DELETE",
      path: "/api/admin/featured-listings/[id]",
      file: "app/api/admin/featured-listings/[id]/route.ts",
    },
  },
  checklists: {
    create: { method: "POST", path: "/api/admin/checklists", file: "app/api/admin/checklists/route.ts" },
    read: [
      { method: "GET", path: "/api/checklists", file: "app/api/checklists/route.ts" },
      { method: "GET", path: "/api/admin/checklists", file: "app/api/admin/checklists/route.ts" },
    ],
    update: {
      method: "PUT",
      path: "/api/admin/checklists/[id]",
      file: "app/api/admin/checklists/[id]/route.ts",
    },
    delete: {
      method: "DELETE",
      path: "/api/admin/checklists/[id]",
      file: "app/api/admin/checklists/[id]/route.ts",
    },
  },
  reviews: {
    create: { method: null, path: null, note: "No hay flujo de creación de reviews (sólo lectura de datos seedeados)." },
    read: [
      {
        method: "GET",
        path: "/api/modelos/[slug]",
        file: "app/api/modelos/[slug]/route.ts",
        note: "Embebe reviews vía getReviews(); no hay endpoint dedicado /api/reviews.",
      },
    ],
    update: { method: null, path: null, note: "No existe edición de reviews." },
    delete: { method: null, path: null, note: "No existe borrado de reviews." },
  },
};
