import { test, expect } from "@playwright/test";

import LoginPage from "../pom/login";
test.describe("Login page", () => {

    const email: string = "oliver@example.com";
    const password: string = "welcome";
    const username: string = "Oliver Smith";
    test("should login to home page", async ({ page }) => {

        const loginPage = new LoginPage(page);

        await loginPage.loginAndVerifyUser({
            email,
            password,
            username
        });
    });
})