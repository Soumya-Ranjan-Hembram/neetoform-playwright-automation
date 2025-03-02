import { test as base } from "@playwright/test";
import LoginPage from "../pom/login";
import FormPage from "../pom/form";

interface ExtendedFixtures {
    loginPage: LoginPage;
    formPage: FormPage;

}

export const test = base.extend<ExtendedFixtures>({
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },
    formPage: async ({ page }, use) => {
        const formPage = new FormPage(page);
        await use(formPage);
    },

})