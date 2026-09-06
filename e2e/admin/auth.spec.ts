import { test, expect, type Page } from "@playwright/test";

// El login admin vive en "/login" (no "/auth/login" -- no existe esa ruta
// en esta app).
async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

test.describe("Admin auth", () => {
  test("logs in as admin and redirects to /dashboard", async ({ page }) => {
    await login(page, "admin", "admin123");
    await page.waitForURL("/dashboard");
  });

  test("rejects a valid model login with the same generic error (never reveals wrong role vs wrong password)", async ({
    page,
  }) => {
    await login(page, "sofia_lima", "password123");
    await expect(page.getByText("Usuario o contraseña incorrectos")).toBeVisible();
    expect(page.url()).toContain("/login");
  });

  test("redirects an unauthenticated visitor away from /dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForURL("/login");
  });
});
