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

    copyLink: string = "";
    constructor(page: Page) {
        this.page = page;
    };

    increaseVisitCount = () => this.visitCount += 1;
    increaseStartCount = () => this.startCount += 1;
    increaseSubmissionCount = () => this.submissionCount += 1;
    getCompletionRate = () => {
        if (this.submissionCount === 0) return this.completionRate = 0;

        this.completionRate = ((this.submissionCount / this.startCount) * 100);
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
    };

    visitPreviewPageAndVerifyEmailField = async (previewPage: Page) => {
        const emailInputField = previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField);
        await expect(emailInputField).toBeVisible();
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

    changeTheQuestion = async (choiceElement, question: string) => {
        await choiceElement.click();
        await this.page.getByTestId(FORM_SELECTORS.contentTextField).fill(question);
    }


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

        this.changeTheQuestion(choiceElement, fieldName);
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


    gotoSettingTab = async () => {
        await this.page.getByTestId(FORM_SELECTORS.settingTab).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.accessControl)).toBeVisible();
    };

    clickOnAccessControl = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.accessControl)).toBeVisible();
        await this.page.getByTestId(FORM_SELECTORS.accessControl).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.accessPasswordRadioInput)).toBeVisible();
    };

    choosePasswordOption = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.accessPasswordRadioInput)).toBeVisible();
        this.page.getByTestId(FORM_SELECTORS.accessPasswordRadioInput).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.accessPasswordInputField)).toBeVisible();
    };

    checkAccessPasswordWorkingProperly = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.accessPasswordInputField)).toBeVisible();
        this.page.getByTestId(FORM_SELECTORS.accessPasswordInputField).fill(FORM_TEXTS.passwordChecker);
        await this.page.getByTestId(FORM_SELECTORS.saveChangeButton).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.accessPasswordInputWarning)).toBeVisible({ timeout: 3000 });
    };

    enterAccessPasswordAndSaveChange = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.accessPasswordInputField)).toBeVisible()
        await this.page.getByTestId(FORM_SELECTORS.accessPasswordInputField).fill("");
        await this.page.getByTestId(FORM_SELECTORS.accessPasswordInputField).fill(FORM_TEXTS.accessingPassword);
        await this.page.getByTestId(FORM_SELECTORS.saveChangeButton).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.toastContainer)).toBeEnabled();
    };

    gotoShareTab = async () => {
        await this.page.getByTestId(FORM_SELECTORS.shareTab).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.shareNeetoHeading)).toBeVisible();
        await expect(this.page.getByTestId(FORM_SELECTORS.linkCopyButton)).toBeVisible();
    };

    copyLinkFromClipboard = async () => {
        try {
            this.copyLink = await this.page.evaluate("navigator.clipboard.readText()");
            console.log("Copied Link: ", this.copyLink);
            return this.copyLink;
        } catch (error) {
            console.error("Failed to read clipboard:", error);
            return null;
        }
    };

    setupClipboardPermissions = async (context: BrowserContext) => {
        await context.grantPermissions(['clipboard-read', 'clipboard-write']);
        return async () => {
            await context.clearPermissions();
        }
    };

    getTheShareLink = async (context: BrowserContext) => {
        await expect(this.page.getByTestId(FORM_SELECTORS.shareNeetoHeading)).toBeVisible();
        const clearPermissions = await this.setupClipboardPermissions(context);

        await this.page.getByTestId(FORM_SELECTORS.linkCopyButton).click()
        await this.page.waitForTimeout(500);
        await this.copyLinkFromClipboard();

        await clearPermissions()
    };

    verifyThePasswordProtectedForm = async (passwordProtectedPage: Page) => {

        await expect(this.copyLink).toBeTruthy();
        await passwordProtectedPage.goto(this.copyLink);
        await expect(passwordProtectedPage.getByTestId(FORM_SELECTORS.passwordProtedPageHeading)).toBeVisible();
        await expect(passwordProtectedPage.getByTestId(FORM_SELECTORS.passwordTextField)).toBeVisible();
        await expect(passwordProtectedPage.getByTestId(FORM_SELECTORS.continueButton)).toBeVisible();
        await passwordProtectedPage.getByTestId(FORM_SELECTORS.passwordTextField).fill(FORM_TEXTS.accessingPassword);
        await passwordProtectedPage.getByTestId(FORM_SELECTORS.continueButton).click();
    };

    submitAndVerifyTheResponse = async (passwordProtectedPage: Page) => {
        await expect(passwordProtectedPage.getByTestId(FORM_SELECTORS.previewEmailTextField)).toBeVisible();
        await passwordProtectedPage.getByTestId(FORM_SELECTORS.previewEmailTextField).fill(FORM_TEXTS.simpleEmail);
        await passwordProtectedPage.getByTestId(FORM_SELECTORS.previewSubmitButton).click();
        await expect(passwordProtectedPage.getByTestId(FORM_SELECTORS.previewThankYouMessage)).toBeVisible();
    };

    clickOnPreventDuplicateSubmission = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.preventDuplicateSubmission)).toBeVisible();
        await this.page.getByTestId(FORM_SELECTORS.preventDuplicateSubmission).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.cookieRadio)).toBeVisible();
    };


    choosePreventDuplicateSubmission = async () => {
        await this.page.getByTestId(FORM_SELECTORS.cookieRadio).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.preventDuplicateSaveChangeButton)).toBeVisible();
        await this.page.getByTestId(FORM_SELECTORS.preventDuplicateSaveChangeButton).click()
        await expect(this.page.getByTestId(FORM_SELECTORS.toastContainer)).toBeEnabled();
    };

    validateThatOneCannotSubmitResponseTwice = async (previewPage: Page, context: BrowserContext) => {
        const emailInputField = previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField);
        await emailInputField.fill(FORM_TEXTS.simpleEmail);
        await previewPage.getByTestId(FORM_SELECTORS.previewSubmitButton).click();
        await expect(previewPage.getByTestId(FORM_SELECTORS.previewThankYouMessage)).toBeVisible();

        const previewUrl = previewPage.url();
        await previewPage.close();

        const newPreviewPage = await context.newPage();
        await newPreviewPage.goto(previewUrl);

        await expect(newPreviewPage.getByTestId(FORM_SELECTORS.previewThankYouMessage)).toBeVisible();

        await newPreviewPage.close();
    };
    openFormWithDifferentCookie = async (previewPage: Page) => {
        await expect(this.copyLink).toBeTruthy();
        await previewPage.goto(this.copyLink);
        const emailInputField = previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField);
        await emailInputField.fill(FORM_TEXTS.simpleEmail);
        await previewPage.getByTestId(FORM_SELECTORS.previewSubmitButton).click();
        await expect(previewPage.getByTestId(FORM_SELECTORS.previewThankYouMessage)).toBeVisible();
        previewPage.close();
    };


    chooseNoCheckOption = async () => {
        await this.gotoSettingTab();
        await expect(this.page.getByTestId(FORM_SELECTORS.preventDuplicateSubmission)).toBeVisible();
        await this.page.getByTestId(FORM_SELECTORS.preventDuplicateSubmission).click();
        await this.page.getByTestId(FORM_SELECTORS.noTrackRadio).click();
        await this.page.getByTestId(FORM_SELECTORS.preventDuplicateSaveChangeButton).click()
        await expect(this.page.getByTestId(FORM_SELECTORS.toastContainer)).toBeEnabled();

    };


    validateThatOneCanSubmitMultipleResponse = async (previewPage: Page, context: BrowserContext) => {
        const emailInputField = await previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField);
        await emailInputField.fill(FORM_TEXTS.simpleEmail2);
        await previewPage.getByTestId(FORM_SELECTORS.previewSubmitButton).click();
        await expect(previewPage.getByTestId(FORM_SELECTORS.previewThankYouMessage)).toBeVisible();
        await previewPage.close();

    };


    changeSingleChoiceFieldName = async (fieldName: string) => {

        const singleChoiceComponent = this.page.getByTestId(FORM_SELECTORS.singleChoiceContainer);

        await this.changeTheQuestion(singleChoiceComponent, fieldName);

        await expect(this.page.getByTestId(FORM_SELECTORS.formGroupQuestion).filter({ hasText: fieldName })).toBeVisible({ timeout: 3000 });
    }

    makeSingleChoiceFirst = async (fieldName: string) => {
        await this.page.getByTestId(FORM_SELECTORS.summaryButton).click();

        const elementToDrag = await this.page.getByTestId(FORM_SELECTORS.newElementField).filter({ hasText: fieldName });

        const targetElement = await this.page.getByTestId(FORM_SELECTORS.newElementField).filter({ hasText: FORM_TEXTS.emailAddress });

        const dragBox = await elementToDrag.boundingBox();
        const targetBox = await targetElement.boundingBox();

        if (dragBox && targetBox) {
            const startX = dragBox.x + dragBox.width / 2;
            const startY = dragBox.y + dragBox.height / 2;

            const endX = startX;
            const endY = targetBox.y - 5;

            await this.page.mouse.move(startX, startY);
            await this.page.mouse.down();

            await this.page.mouse.move(startX, startY - 50, { steps: 5 });
            await this.page.mouse.move(endX, endY, { steps: 10 });

            await this.page.waitForTimeout(100);
            await this.page.mouse.up();

            await this.page.waitForTimeout(500);
        };

        await this.page.getByTestId(FORM_SELECTORS.addElementButton).filter({ hasText: FORM_TEXTS.close }).click()
    };


    modifyAndAddYesNoOption = async (fieldName: string) => {

        await this.page.getByTestId(FORM_SELECTORS.choicePreviewGroup)
            .filter({ has: this.page.getByTestId(FORM_SELECTORS.singleChoiceContainer) })
            .click();

        await this.page.getByTestId(FORM_SELECTORS.optionInput3).hover();
        await this.page.getByTestId(FORM_SELECTORS.deleteOptionButton3).click();
        await this.page.getByTestId(FORM_SELECTORS.optionInput2).hover();
        await this.page.getByTestId(FORM_SELECTORS.deleteOptionButton2).click();
        await this.page.getByTestId(FORM_SELECTORS.optionInput0).fill(FORM_TEXTS.yes);
        await this.page.getByTestId(FORM_SELECTORS.optionInput1).fill(FORM_TEXTS.no);
    };

    clickOnConditionalLogic = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.conditionalLogic)).toBeVisible();
        await this.page.getByTestId(FORM_SELECTORS.conditionalLogic).click();
        await expect(this.page.getByTestId(FORM_SELECTORS.conditionaLogicButton)).toBeVisible();
        await this.page.waitForTimeout(1000)
    }
    addNewConditionalLogic = async () => {
        await expect(this.page.getByTestId(FORM_SELECTORS.conditionaLogicButton)).toBeVisible();
        await this.page.getByTestId(FORM_SELECTORS.conditionaLogicButton).click();

    }
    addCondition = async () => {

        await this.page.getByTestId(FORM_SELECTORS.conditionQuestionSelectInput).click();
        await this.page.getByText(FORM_TEXTS.interestedInPlaywright, { exact: true }).click();

        await this.page.getByTestId(FORM_SELECTORS.conditionVerbSelectInput).click();
        await this.page.getByText(FORM_TEXTS.contain, { exact: true }).click();
        await this.page.getByTestId(FORM_SELECTORS.conditionValueSelectInput).click();
        await this.page.getByText(FORM_TEXTS.yes, { exact: true }).click();

        await this.page.getByTestId(FORM_SELECTORS.actionTypeSelectInput).click();
        await this.page.getByText(FORM_TEXTS.show, { exact: true }).click();
        await this.page.getByTestId(FORM_SELECTORS.actionFieldSelectInput).click();
        await this.page.getByText(FORM_TEXTS.emailAddress, { exact: true }).click();
    }

    saveConditionalLogicChange = async () => {
        await this.page.getByTestId(FORM_SELECTORS.saveChangeButton).click();
    }

    verifyConditionFunctionality = async (previewPage: Page) => {
        await previewPage.getByTestId(FORM_SELECTORS.formSingleChoiceOption).filter({ hasText: FORM_TEXTS.no }).click();
        await expect(previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField)).not.toBeVisible()
        await previewPage.getByTestId(FORM_SELECTORS.formSingleChoiceOption).filter({ hasText: FORM_TEXTS.yes }).click();
        await expect(previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField)).toBeVisible()
    }

    clickConditionLogicOptions = async () => {
        await this.page.getByTestId(FORM_SELECTORS.conditionLogicDropdown).click();
        await this.page.getByTestId(FORM_SELECTORS.conditionsDisableButton).click();
    }

    verifyConditionLogicIsDisabled = async (previewPage: Page) => {
        await previewPage.getByTestId(FORM_SELECTORS.formSingleChoiceOption).filter({ hasText: FORM_TEXTS.no }).click();
        await expect(previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField)).toBeVisible()
        await previewPage.getByTestId(FORM_SELECTORS.formSingleChoiceOption).filter({ hasText: FORM_TEXTS.yes }).click();
        await expect(previewPage.getByTestId(FORM_SELECTORS.previewEmailTextField)).toBeVisible()
    }
};



