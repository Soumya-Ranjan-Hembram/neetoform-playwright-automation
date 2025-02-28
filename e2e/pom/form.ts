import { BrowserContext, Page, expect } from "@playwright/test";
import { FORM_SELECTORS } from "../constants/selectors/form";
import { FORM_TEXTS } from "../constants/texts/form";


interface FormName {
    formName: string;
}

export default class FormPage {
    page: Page;
    constructor(page: Page) {
        this.page = page;
    };

    createNewForm = async () => {
        await this.page.getByTestId(FORM_SELECTORS.addFormButton).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.startFromScratch)).toBeVisible({ timeout: 5000 });
        await this.page.getByTestId(FORM_SELECTORS.startFromScratch).click();
    };

    updateFormName = async ({ formName }: FormName) => {
        await expect(this.page.getByTestId(FORM_SELECTORS.elementContainer)).toBeVisible({ timeout: 30000 });
        await expect(this.page.getByTestId(FORM_SELECTORS.publishButton)).toBeVisible({ timeout: 30000 });

        await this.page.getByTestId(FORM_SELECTORS.neetoFormTitle).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.neetoFormTitleField)).toBeVisible();
        const nameInput = this.page.getByTestId(FORM_SELECTORS.neetoFormTitleField);
        await nameInput.fill("");
        await nameInput.fill(formName);

        await this.page.getByTestId(FORM_SELECTORS.neetoFormTitleFieldSubmitButton).click();
        const actualText = (await this.page.getByTestId(FORM_SELECTORS.neetoFormTitle).textContent()) || "";
        await expect(actualText.trim()).toBe(formName);
    };

    addFormFields = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.elementContainer)).toBeVisible({ timeout: 30000 });
        await expect(this.page.getByTestId(FORM_SELECTORS.publishButton)).toBeVisible({ timeout: 30000 });

        await this.page.getByTestId(FORM_SELECTORS.fullNameElement).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.fullNamePreview)).toBeVisible();
        await this.page.getByTestId(FORM_SELECTORS.phoneNumberElement).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.phoneNumberPreview)).toBeVisible();
    };


    publishForm = async () => {
        await this.page.getByTestId(FORM_SELECTORS.publishButton).click();

        const toastMessages = this.page.getByTestId(FORM_SELECTORS.toastContainer).filter({ hasText: "The form is successfully published" });

        await expect(toastMessages).toBeVisible({ timeout: 3000 });
    };

    openPublishedForm = async (context: BrowserContext) => {
        const pagePromise = context.waitForEvent("page");
        await this.page.getByTestId(FORM_SELECTORS.publishPreviewButton).click();

        const previewPage = await pagePromise;
        await previewPage.waitForLoadState("domcontentloaded", { timeout: 60000 });

        return previewPage;
    };

    verifyFields = async (previewPage: Page) => {
        const emailInputField = previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField);
        await expect(emailInputField).toBeVisible();

        const firstNameInputField = previewPage.getByTestId(FORM_SELECTORS.previewFirstNameTextField);
        await expect(firstNameInputField).toBeVisible();

        const lastNameInputField = previewPage.getByTestId(FORM_SELECTORS.previewLastNameTextField);
        await expect(lastNameInputField).toBeVisible();

        const numberInputField = previewPage.getByTestId(FORM_SELECTORS.previewPhoneNumberInputField);
        await expect(numberInputField).toBeVisible();
    };


    validateFieldErrors = async (previewPage: Page) => {

        await previewPage.getByTestId(FORM_SELECTORS.previewSubmitButton).click();


        await expect(previewPage.getByText(FORM_TEXTS.requiredEmailFieldErrorMessage)).toBeVisible();
        await expect(previewPage.getByText(FORM_TEXTS.requiredFirstNameFieldErrorMessage)).toBeVisible();
        await expect(previewPage.getByText(FORM_TEXTS.requiredLastNameFieldErrorMessage)).toBeVisible();
        await expect(previewPage.getByText(FORM_TEXTS.requiredPhoneNumberFieldErrorMessage)).toBeVisible();


        await previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField).fill(FORM_TEXTS.falseEmail);
        await previewPage.getByTestId(FORM_SELECTORS.previewPhoneNumberInputField).fill(FORM_TEXTS.unUseNumber);


        await previewPage.getByTestId(FORM_SELECTORS.previewSubmitButton).click();

        await expect(previewPage.getByText(FORM_TEXTS.emailInvalidErrorMessage)).toBeVisible();
        await expect(previewPage.getByText(FORM_TEXTS.USNumberFormatErrorMessage)).toBeVisible();


        await previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField).fill("");
        await previewPage.getByTestId(FORM_SELECTORS.previewPhoneNumberInputField).fill("");
    };


    fillAndSubmitForm = async (previewPage: Page, {
        firstName,
        lastName,
        email,
        phoneNumber
    }) => {
        await previewPage.getByTestId(FORM_SELECTORS.previewFirstNameTextField).fill(firstName);
        await previewPage.getByTestId(FORM_SELECTORS.previewLastNameTextField).fill(lastName);
        await previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField).fill(email);
        await previewPage.getByTestId(FORM_SELECTORS.previewPhoneNumberInputField).fill(phoneNumber);

        await Promise.all([
            previewPage.waitForURL(FORM_TEXTS.thankYouURL),
            previewPage.getByTestId(FORM_SELECTORS.previewSubmitButton).click()
        ]);

        await expect(previewPage.getByTestId(FORM_SELECTORS.thankYouMessage)).toBeVisible();
        await expect(previewPage.getByText(FORM_TEXTS.thankYou)).toBeVisible();
        await expect(previewPage.getByText(FORM_TEXTS.responseReceived)).toBeVisible();

        await previewPage.close();
    };

    validateTheSubmissionFields = async ({ formName }: FormName, {
        firstName,
        lastName,
        email,
    }) => {
        await expect(this.page.getByTestId(FORM_SELECTORS.submissionTab)).toBeVisible();
        await this.page.getByTestId(FORM_SELECTORS.submissionTab).click();

        const fullName = `${firstName} ${lastName}`;

        await expect(this.page.getByText(fullName)).toBeVisible();
        await expect(this.page.getByText(email)).toBeVisible();
        await this.page.close();
    };
};