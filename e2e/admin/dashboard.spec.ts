import { test, expect, type Page } from "@playwright/test";

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.locator("#username").fill("admin");
  await page.locator("#password").fill("admin123");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("/dashboard");
}

test.describe("Admin dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("shows the real stat card labels (not the fictional 'Total Modelos'/'Featured' cards)", async ({
    page,
  }) => {
    await expect(page.getByText("Modelos verificadas")).toBeVisible();
    await expect(page.getByText("Pendientes verificación")).toBeVisible();
    await expect(page.getByText("Featured activos")).toBeVisible();
    await expect(page.getByText("Reseñas")).toBeVisible();
  });

  test("navigates to Modelos via the real sidebar link and sees real action buttons", async ({
    page,
  }) => {
    await page.getByRole("link", { name: "Modelos", exact: true }).click();
    await page.waitForURL(/\/dashboard\/modelos/);

    await expect(page.getByRole("link", { name: "Ver" }).first()).toBeVisible();
    const hasVerifyAction = await page
      .getByRole("button", { name: /Verificar|Quitar verificación/ })
      .first()
      .isVisible();
    expect(hasVerifyAction).toBe(true);
  });

  test("searches models by username (requires submitting the real Filtrar form, not live typing)", async ({
    page,
  }) => {
    // Se busca por "sofia_lima" (username) en vez de "Sofía" (name): ILIKE
    // no es accent-insensitive, así que buscar "Sofia" sin tilde no
    // matchearía la columna name con "í" -- el username evita esa ambigüedad.
    await page.goto("/dashboard/modelos");
    await page.getByPlaceholder("Buscar por nombre...").fill("sofia_lima");
    await page.getByRole("button", { name: "Filtrar" }).click();

    await page.waitForURL(/search=sofia_lima/);
    await expect(page.getByRole("cell", { name: "Sofía" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Camila" })).not.toBeVisible();
  });

  test("opens a model's real detail page", async ({ page }) => {
    await page.goto("/dashboard/modelos");
    await page.getByRole("link", { name: "Ver" }).first().click();

    await page.waitForURL(/\/dashboard\/modelos\/.+/);
    await expect(page.getByRole("heading", { name: "Información del perfil" })).toBeVisible();
  });

  test("opens the create-featured dialog with the real fixed plans", async ({ page }) => {
    await page.goto("/dashboard/featured");
    await page.getByRole("button", { name: "Crear destacado" }).click();

    const dialog = page.getByRole("dialog");
    await expect(dialog.getByRole("heading", { name: "Crear destacado" })).toBeVisible();
    await expect(dialog.getByText("S/ 50 x 7 días")).toBeVisible();
    await expect(dialog.getByText("S/ 75 x 7 días")).toBeVisible();

    // El diálogo real se cierra con su botón "Cancelar" (no tiene handler de
    // Escape). Se acota al role=dialog porque la tabla de destacados activos
    // detrás también tiene botones "Cancelar" por fila.
    await dialog.getByRole("button", { name: "Cancelar" }).click();
    await expect(dialog).not.toBeVisible();
  });

  test("reportes page shows the real metric labels and bar chart titles", async ({ page }) => {
    await page.goto("/dashboard/reportes");

    await expect(page.getByText("Modelos nuevas")).toBeVisible();
    await expect(page.getByText("Reseñas nuevas")).toBeVisible();
    await expect(page.getByText("Modelos por género")).toBeVisible();
    await expect(page.getByText("Modelos más reseñadas")).toBeVisible();
  });
});
