import { test } from "../fixture";
import { STORAGE_STATE } from "../../playwright.config";

test.describe("Login page", () => {

    const email: string = "oliver@example.com";
    const password: string = "welcome";
    const username: string = "Oliver Smith";
    test("should login to home page", async ({ page, loginPage }) => {
        await loginPage.loginAndVerifyUser({
            email,
            password,
            username
        });
        await page.context().storageState({ path: STORAGE_STATE });
    });
});