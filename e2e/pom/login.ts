import { Page, expect } from "@playwright/test";
import { LOGIN_SELECTORS } from "../constants/selectors/login";

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

        await this.page.getByTestId(LOGIN_SELECTORS.emailField).fill(email);
        await this.page.getByTestId(LOGIN_SELECTORS.passwordField).fill(password);

        await this.page.getByTestId(LOGIN_SELECTORS.loginButton).click();
        await expect(this.page.getByTestId(LOGIN_SELECTORS.mainHeader)).toBeVisible();
    }
}