import { test, expect, type Page } from "@playwright/test";

// El formulario de registro real (LoginForm.tsx, tab "Registro") solo pide
// usuario/contraseña/confirmar -- no hay selección de rol ni email; todo
// registro nuevo se crea como 'customer' y redirige a "/", no a onboarding.
async function login(page: Page, username: string, password: string) {
  await page.goto("/login");
  await page.locator("#username").fill(username);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: "Ingresar" }).click();
}

test.describe("Client auth", () => {
  test("logs in with valid credentials and redirects home", async ({ page }) => {
    await login(page, "sofia_lima", "password123");
    await page.waitForURL("/");
    await expect(page.getByText("sofia_lima")).toBeVisible();
  });

  test("shows the real (deliberately generic) error for a wrong password", async ({ page }) => {
    await login(page, "sofia_lima", "wrongpassword");
    await expect(page.getByText("Usuario o contraseña incorrectos")).toBeVisible();
  });

  test("registers a new customer and redirects home (not onboarding)", async ({ page }) => {
    const username = `e2e_user_${Date.now()}`;

    await page.goto("/login");
    await page.getByRole("button", { name: "Registro" }).click();
    await page.locator("#reg-username").fill(username);
    await page.locator("#reg-password").fill("password123");
    await page.locator("#reg-password2").fill("password123");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await page.waitForURL("/");
    await expect(page.getByText(username)).toBeVisible();
  });

  test("shows a real error for mismatched passwords on registration", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("button", { name: "Registro" }).click();
    await page.locator("#reg-username").fill(`e2e_mismatch_${Date.now()}`);
    await page.locator("#reg-password").fill("password123");
    await page.locator("#reg-password2").fill("different456");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();
  });

  test("logs out and the header reverts to the logged-out state", async ({ page }) => {
    await login(page, "sofia_lima", "password123");
    await page.waitForURL("/");

    await page.getByRole("button", { name: "Cerrar sesión" }).click();
    await expect(page.getByRole("link", { name: "Iniciar sesión" })).toBeVisible();

    // Confirma que la sesión realmente se cerró, no solo la UI del header.
    await page.goto("/modelo/dashboard");
    await page.waitForURL("/login");
  });
});
