import { Page, expect } from "@playwright/test";

export default class LoginPage {

    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    loginAndVerifyUser = async ({
        email,
        password,
        username
    }: {
        email: string;
        password: string;
        username: string;
    }) => {
        await this.page.goto("https://neeto-form-web-playwright.neetodeployapp.com/")

        await this.page.locator('[data-test-id="login-email"]').fill("oliver@example.com");
        await this.page.locator('[data-test-id="login-password"]').fill('welcome');

        await this.page.locator('[data-test-id="login-submit-button"]').click();
        await expect(this.page.getByRole('button', { name: `avatar-${username}` })).toBeVisible();
    }
}