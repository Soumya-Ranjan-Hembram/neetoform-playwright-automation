import { test } from "../fixture";
import { STORAGE_STATE } from "../../playwright.config";

test.describe("Login page", () => {

    test("should login to home page", async ({ page, loginPage }) => {
        page.goto("/");
        await loginPage.loginAndVerifyUser({
            email: "oliver@example.com",
            password: "welcome",
            username: "Oliver Smith"
        });
        await page.context().storageState({ path: STORAGE_STATE });
    });
});