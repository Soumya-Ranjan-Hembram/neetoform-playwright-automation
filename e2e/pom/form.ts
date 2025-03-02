import { BrowserContext, Page, expect } from "@playwright/test";
import { FORM_SELECTORS } from "../constants/selectors/form";
import { FORM_TEXTS } from "../constants/texts/form";


interface FormName {
    formName: string;
}

export default class FormPage {
    page: Page;

    originalOptions: string;
    randomizedOptions: string;


    visitCount: number = 0;
    startCount: number = 0;
    submissionCount: number = 0;
    completionRate: number = 0;

    constructor(page: Page) {
        this.page = page;
    };

    increaseVisitCount = () => this.visitCount += 1;
    increaseStartCount = () => this.startCount += 1;
    increaseSubmissionCount = () => this.submissionCount += 1;
    getCompletionRate = () => {
        if (this.submissionCount === 0) return this.completionRate = 0;

        this.completionRate = ((this.submissionCount / this.startCount) * 100)
    }



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
    };

    visitPreviewPageAndVerifyEmailField = async (previewPage: Page) => {
        const emailInputField = previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField);
        await expect(emailInputField).toBeVisible();
    }

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


    addSingleChoiceElement = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.elementContainer)).toBeVisible({ timeout: 30000 });
        await expect(this.page.getByTestId(FORM_SELECTORS.publishButton)).toBeVisible({ timeout: 30000 });

        await this.page.getByTestId(FORM_SELECTORS.singleChoiceElement).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.choicePreviewGroup).filter({ has: this.page.getByTestId(FORM_SELECTORS.singleChoiceContainer) })).toBeVisible();
    };

    addMultiChoiceElement = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.elementContainer)).toBeVisible({ timeout: 30000 });
        await expect(this.page.getByTestId(FORM_SELECTORS.publishButton)).toBeVisible({ timeout: 30000 });

        await this.page.getByTestId(FORM_SELECTORS.multiChoiceElement).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.choicePreviewGroup).filter({ has: this.page.getByTestId(FORM_SELECTORS.multiChoiceContainer) })).toBeVisible();
    };

    addBulkOptionsToElements = async () => {
        const singleChoicePreviewComponent = this.page
            .getByTestId(FORM_SELECTORS.choicePreviewGroup)
            .filter({ has: this.page.getByTestId(FORM_SELECTORS.singleChoiceContainer) });

        const multiChoicePreviewComponent = this.page
            .getByTestId(FORM_SELECTORS.choicePreviewGroup)
            .filter({ has: this.page.getByTestId(FORM_SELECTORS.multiChoiceContainer) });


        await expect(singleChoicePreviewComponent).toBeVisible();
        await expect(multiChoicePreviewComponent).toBeVisible();

        await this.addBulkOptions(singleChoicePreviewComponent, FORM_TEXTS.singleDemoFieldName);
        await this.addBulkOptions(multiChoicePreviewComponent, FORM_TEXTS.multiDemoFieldName);
    };

    addBulkOptions = async (choiceElement, fieldName) => {
        await choiceElement.click();
        await this.page.getByTestId(FORM_SELECTORS.contentTextField).fill(fieldName);
        await this.page.getByTestId(FORM_SELECTORS.addBulkOptionLink).click();

        await expect(this.page.getByTestId(FORM_SELECTORS.bulkOptionsTextArea)).toBeVisible();
        await expect(this.page.getByTestId(FORM_SELECTORS.bulkOptionsDoneButton)).toBeVisible();

        await this.page.getByTestId(FORM_SELECTORS.bulkOptionsTextArea).fill("Option 5, Option 6, Option 7, Option 8, Option 9, Option 10");
        await this.page.getByTestId(FORM_SELECTORS.bulkOptionsDoneButton).click();
        await this.page.waitForTimeout(2000);
    };

    enableRandomization = async (choiceElement) => {
        await choiceElement.click();
        await this.page.getByTestId(FORM_SELECTORS.randomizeSwitchLabel).click();

        const warningText = await this.page.getByTestId(FORM_SELECTORS.randomizeWarningError).textContent();
        expect(warningText?.trim()).toBe(FORM_TEXTS.waringTextRandomization);
    };


    addRandomizationToSingleChoice = async () => {
        const singleChoicePreviewComponent = this.page.getByTestId(FORM_SELECTORS.choicePreviewGroup).filter({ has: this.page.getByTestId(FORM_SELECTORS.singleChoiceContainer) });

        await this.enableRandomization(singleChoicePreviewComponent);


        const original = await this.page.getByTestId(FORM_SELECTORS.singleChoiceOptionContainer).allInnerTexts();

        this.originalOptions = await JSON.stringify(original);

        console.log(this.originalOptions);
    };


    hideMultiChoiceElement = async () => {
        const multiChoicePreviewComponent = this.page.getByTestId(FORM_SELECTORS.choicePreviewGroup).filter({ has: this.page.getByTestId(FORM_SELECTORS.multiChoiceContainer) });

        await multiChoicePreviewComponent.click();
        await this.page.getByTestId(FORM_SELECTORS.questionHideToggle).click();

        const warningMessage = await this.page.getByTestId(FORM_SELECTORS.questionHideWarning).textContent();
        expect(warningMessage?.trim()).toBe(FORM_TEXTS.questionHideWaringMessage)

        await this.page.waitForTimeout(1000);
    };

    unhideMultiChoiceElement = async () => {
        const multiChoicePreviewComponent = this.page.getByTestId(FORM_SELECTORS.choicePreviewGroup).filter({ has: this.page.getByTestId(FORM_SELECTORS.multiChoiceContainer) });

        await multiChoicePreviewComponent.click();
        await this.page.getByTestId(FORM_SELECTORS.questionHideToggle).click();
    };



    validateMultipleIsHiddenAndSingleIsVisible = async (previewPage: Page) => {

        await expect(previewPage.getByText(FORM_TEXTS.singleDemoFieldImportant)).toBeVisible();

        await expect(previewPage.getByText(FORM_TEXTS.multiDemoFieldImportant)).not.toBeVisible({ timeout: 10000 });
    }

    validateSingleChoiceIsRandomized = async (previewPage: Page) => {

        const previewPageSingleChoiceList = await previewPage.getByTestId(FORM_SELECTORS.singleChoiceOptionContainer).allInnerTexts()
        this.randomizedOptions = JSON.stringify(previewPageSingleChoiceList);
        console.log(this.randomizedOptions);
        await expect(this.randomizedOptions).not.toBe(this.originalOptions)
    }

    validateBothMultipleAndSingleIsVisible = async (previewPage) => {

        await expect(previewPage.getByText(FORM_TEXTS.singleDemoFieldImportant)).toBeVisible();

        await expect(previewPage.getByText(FORM_TEXTS.multiDemoFieldImportant)).toBeVisible();

    };

    gotoAnalyticsTab = async () => {
        await this.page.getByTestId(FORM_SELECTORS.moreDropdownIcon).click();
        await this.page.getByTestId(FORM_SELECTORS.analyticsTab).click();

        await expect(this.page.getByTestId(FORM_SELECTORS.submissionInsightTitle)).toBeVisible();
        await expect(this.page.getByTestId(FORM_SELECTORS.visitMetric).getByTestId(FORM_SELECTORS.insightCount)).toBeVisible();
        await expect(this.page.getByTestId(FORM_SELECTORS.startMetric).getByTestId(FORM_SELECTORS.insightCount)).toBeVisible();
        await expect(this.page.getByTestId(FORM_SELECTORS.submissionMetric).getByTestId(FORM_SELECTORS.insightCount)).toBeVisible();
        await expect(this.page.getByTestId(FORM_SELECTORS.completionRateMetric).getByTestId(FORM_SELECTORS.insightCount)).toBeVisible();

    }
    gotoBuildTab = async () => {
        await this.page.getByTestId(FORM_SELECTORS.buildTab).click()
        await expect(this.page.getByTestId(FORM_SELECTORS.elementContainer)).toBeVisible({ timeout: 30000 });
        await expect(this.page.getByTestId(FORM_SELECTORS.publishButton)).toBeVisible({ timeout: 30000 });
    }

    verifyInitialInsights = async () => {

        const visitCountOnPage = await this.page.getByTestId(FORM_SELECTORS.visitMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        const startCountOnPage = await this.page.getByTestId(FORM_SELECTORS.startMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        const submissionCountOnPage = await this.page.getByTestId(FORM_SELECTORS.submissionMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        const completionRateOnPage = await this.page.getByTestId(FORM_SELECTORS.completionRateMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();

        expect(visitCountOnPage).toBe(String(this.visitCount));
        expect(startCountOnPage).toBe(String(this.startCount));
        expect(submissionCountOnPage).toBe(String(this.submissionCount));
        expect(completionRateOnPage).toBe(`${this.completionRate}%`);
    };

    verifyVisitCountIncrease = async (context: BrowserContext) => {
        const previewPage = await this.openPublishedForm(context);
        this.increaseVisitCount()
        await previewPage.close();

        await this.gotoAnalyticsTab();
        await this.page.reload();
        const visitCount = await this.page.getByTestId(FORM_SELECTORS.visitMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        expect(visitCount).toBe(String(this.visitCount));
        await this.gotoBuildTab();
    };


    verifyStartCountIncrease = async (context: BrowserContext) => {
        const previewPage = await this.openPublishedForm(context);
        await previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField).fill(FORM_TEXTS.falseEmail);
        this.increaseVisitCount();
        this.increaseStartCount();
        await previewPage.close();

        await this.gotoAnalyticsTab();
        await this.page.reload();

        const visitCountOnPage = await this.page.getByTestId(FORM_SELECTORS.visitMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        const startCountOnPage = await this.page.getByTestId(FORM_SELECTORS.startMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();

        expect(visitCountOnPage).toBe(String(this.visitCount));
        expect(startCountOnPage).toBe(String(this.startCount));

        await this.gotoBuildTab();
    };

    verifySubmissionCountIncrease = async (context: BrowserContext) => {
        const previewPage: Page = await this.openPublishedForm(context);

        await previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField).fill(FORM_TEXTS.simpleEmail);
        this.increaseVisitCount();

        await previewPage.getByTestId(FORM_SELECTORS.previewSubmitButton).click();
        this.increaseSubmissionCount()
        this.getCompletionRate();
        await previewPage.close();

        await this.gotoAnalyticsTab();

        await this.page.reload();

        const visitCount = await this.page.getByTestId(FORM_SELECTORS.visitMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        const startCount = await this.page.getByTestId(FORM_SELECTORS.startMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        const submissionCount = await this.page.getByTestId(FORM_SELECTORS.submissionMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        const completionRate = await this.page.getByTestId(FORM_SELECTORS.completionRateMetric).getByTestId(FORM_SELECTORS.insightCount).textContent();
        expect(visitCount).toBe(String(this.visitCount));
        expect(startCount).toBe(String(this.startCount));
        expect(submissionCount).toBe(String(this.submissionCount));
        expect(completionRate).toBe(String(this.completionRate) + "%");
    };
};