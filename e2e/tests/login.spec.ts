import { test, expect } from "@playwright/test";


test.describe("Login page", () => {
    test("should login to home page", async ({ page }) => {
        await page.goto("https://neeto-form-web-playwright.neetodeployapp.com/")

        await page.locator('[data-test-id="login-email"]').fill("oliver@example.com");
        await page.locator('[data-test-id="login-password"]').fill('welcome');

        await page.locator('[data-test-id="login-submit-button"]').click();
        await expect(page.getByRole('button', { name: 'avatar-Oliver Smith' })).toBeVisible();

    });
})