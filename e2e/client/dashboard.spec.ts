import { test, expect, type Page } from "@playwright/test";

async function loginAsSofia(page: Page) {
  await page.goto("/login");
  await page.locator("#username").fill("sofia_lima");
  await page.locator("#password").fill("password123");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await page.waitForURL("/");
}

test.describe("Modelo dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsSofia(page);
  });

  test("dashboard shows the promo banner and real nav links", async ({ page }) => {
    await page.goto("/modelo/dashboard");
    await expect(page.getByText("DESTACAR MI ANUNCIO")).toBeVisible();
    await expect(page.getByRole("link", { name: "Mi perfil" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Mis fotos" })).toBeVisible();
  });

  test("edits the profile and shows the real success message", async ({ page }) => {
    await page.goto("/modelo/dashboard/perfil");

    const bio = page.locator("#bio");
    await bio.fill(`Bio de prueba E2E ${Date.now()}`);
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    await expect(page.getByText("Perfil actualizado correctamente.")).toBeVisible();
  });

  test("fotos page shows the real upload control and gallery", async ({ page }) => {
    await page.goto("/modelo/dashboard/fotos");
    // El botón dispara un <input type="file"> oculto y postea FormData a
    // /api/modelos/fotos (upload server-side a Supabase Storage).
    await expect(page.getByRole("button", { name: "Subir foto" })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText(/Galería/)).toBeVisible();
  });

  test("toggles a service and saves with the real success message", async ({ page }) => {
    await page.goto("/modelo/dashboard/servicios");
    await expect(page.getByText("24 horas disponible")).toBeVisible();

    // Alterna "Masaje" (cualquiera sea su estado actual) para forzar un cambio
    // real y habilitar "Guardar cambios" (deshabilitado si no hay cambios).
    await page.getByText("Masaje", { exact: true }).click();
    await page.getByRole("button", { name: "Guardar cambios" }).click();

    await expect(page.getByText("Servicios actualizados correctamente.")).toBeVisible();

    // Revertir para dejar el estado sembrado intacto para otros tests/runs.
    await page.getByText("Masaje", { exact: true }).click();
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByText("Servicios actualizados correctamente.")).toBeVisible();
  });

  test("reviews page shows real seeded reviews or the real empty state", async ({ page }) => {
    await page.goto("/modelo/dashboard/reviews");
    await expect(page.getByRole("heading", { name: "Mis reseñas" })).toBeVisible();

    const hasReviews = await page.getByText(/reseña$|reseñas$/).first().isVisible().catch(() => false);
    if (!hasReviews) {
      await expect(page.getByText("Aún no tienes reseñas.")).toBeVisible();
    }
  });

  test("the Telegram contact link carries the model's real (URL-encoded) name", async ({ page }) => {
    await page.goto("/modelo/dashboard");
    const link = page.getByRole("link", { name: /Contactar admin vía Telegram/i });
    await expect(link).toBeVisible();

    const href = await link.getAttribute("href");
    expect(href).toContain("t.me/");
    expect(href).toContain(encodeURIComponent("Sofía")); // el nombre va URL-encoded, no literal
  });
});
