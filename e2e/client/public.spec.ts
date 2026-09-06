import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("home page renders the real hero + recommended grid (no fictional 'Bienvenido' copy)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Modelos recomendadas" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Models" })).toBeVisible();
  });

  test("modelos listing shows real filter labels and at least one model card", async ({ page }) => {
    await page.goto("/modelos");
    await expect(page.getByText("Género", { exact: true })).toBeVisible();
    await expect(page.getByText("Ciudad", { exact: true })).toBeVisible();

    const verPerfilButtons = page.getByRole("link", { name: "Ver perfil" });
    expect(await verPerfilButtons.count()).toBeGreaterThan(0);
  });

  test("filtering by gender actually submits and updates the URL", async ({ page }) => {
    await page.goto("/modelos");
    await page.locator('input[type="radio"][value="WOMAN"]').check();
    await page.getByRole("button", { name: "Aplicar" }).click();

    await page.waitForURL(/gender=WOMAN/);
  });

  test("clicking Ver perfil on a real seeded model navigates to her real profile", async ({
    page,
  }) => {
    await page.goto("/modelos");

    // El nombre y el botón "Ver perfil" viven en el mismo Card, no en el
    // mismo <a> -- se usa el data-testid del Card para acotar el scope en
    // vez de una búsqueda frágil por texto ancestro.
    await page.getByTestId("model-card-sofia-lima").getByRole("link", { name: "Ver perfil" }).click();

    await page.waitForURL(/\/modelos\/sofia-lima/);
    // El nombre real sembrado es solo "Sofía" (sin apellido, a diferencia
    // del mock-data descartado que sí tenía "Sofía Martínez").
    await expect(page.getByRole("heading", { name: "Sofía", exact: true })).toBeVisible();
  });
});
