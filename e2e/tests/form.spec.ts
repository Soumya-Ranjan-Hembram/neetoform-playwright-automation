import { expect } from "@playwright/test";
import { test } from "../fixture";
import { faker } from "@faker-js/faker";
test.describe('Form page', () => {
    let formName: string;
    let firstName: string;
    let lastName: string;
    let email: string;
    let phoneNumber: string;


    test.beforeEach(async ({ page }, testInfo) => {
        formName = faker.word.sample(10);
        firstName = faker.person.firstName();
        lastName = faker.person.lastName();
        email = faker.internet.email();
        phoneNumber = "2025550123";

        if (testInfo.title.includes("[SKIP_SETUP]")) return;
        await page.goto("/");
    });

    test.afterEach(async ({ page }) => {
        await page.close();
    });

    test("should create and submit a form", async ({ page, context, formPage }) => {
        let previewPage;

        await test.step("Step 1: Clicked on add new form", async () => {
            await formPage.createNewForm();
        });

        await test.step("Step 2: Update form name", async () => {
            await formPage.updateFormName({ formName });
        });

        await test.step("Step 3: Add full name and phone number fields", async () => {
            await formPage.addFormFields();
        });

        await test.step("Step 4: Publish the form", async () => {
            await formPage.publishForm();

            previewPage = await formPage.openPublishedForm(context);

            await formPage.verifyFields(previewPage);
            await previewPage.close();

        });

        await test.step("Step 5: Validate field errors", async () => {
            previewPage = await formPage.openPublishedForm(context);
            await formPage.validateFieldErrors(previewPage);
            await previewPage.close();
        });

        await test.step("Step 6: Fill and submit the form", async () => {
            previewPage = await formPage.openPublishedForm(context);
            await formPage.fillAndSubmitForm(previewPage, {
                firstName,
                lastName,
                email,
                phoneNumber
            });
            await previewPage.close();

        });

        await test.step("Step 7: Validate submission fields", async () => {
            await formPage.validateTheSubmissionFields(
                { formName },
                { firstName, lastName, email }
            );
        });
    });


    test("should customize form's field elements", async ({ page, context, formPage }) => {
        await test.step("Step 1: Create a new form and update name", async () => {
            await formPage.createNewForm();
            await formPage.updateFormName({ formName });
        });

        await test.step("Step 2: Add single and multi-choice elements", async () => {
            await formPage.addSingleChoiceElement();
            await formPage.addMultiChoiceElement();
        });

        await test.step("Step 3: Add six more options and randomize single choice", async () => {
            await formPage.addBulkOptionsToElements();
            await formPage.hideMultiChoiceElement();
        });

        await test.step("Step 4: Hide multi-choice element and publish form", async () => {
            await formPage.addRandomizationToSingleChoice();
            await formPage.publishForm();
        });

        await test.step("Step 5: Verify hidden and randomized elements", async () => {
            const previewPage = await formPage.openPublishedForm(context);
            await formPage.validateSingleChoiceIsRandomized(previewPage)
            await formPage.validateMultipleIsHiddenAndSingleIsVisible(previewPage);
            await previewPage.close();

        });

        await test.step("Step 6: Unhide multi-choice element and republish", async () => {
            await formPage.unhideMultiChoiceElement();
            await formPage.publishForm();
        });

        await test.step("Step 7: Verify both fields are visible in published form", async () => {
            const previewPage = await formPage.openPublishedForm(context);
            await formPage.validateBothMultipleAndSingleIsVisible(previewPage);
            await previewPage.close()
        });
    });


    test('should verify form insights', async ({
        page,
        context,
        formPage,
    }) => {

        let previewPage;
        await test.step("Step 1: Create a new form and update name", async () => {

            await formPage.createNewForm();
            await formPage.updateFormName({ formName });

        });
        await test.step("Step 2: Publish form and goto analytics page", async () => {

            await formPage.publishForm();
            await formPage.gotoAnalyticsTab();

        });

        await test.step("Step 3: visit preview page and check the visits count", async () => {
            await formPage.verifyInitialInsights();
            await formPage.gotoBuildTab();


            previewPage = await formPage.openPublishedForm(context);
            await formPage.visitPreviewPageAndVerifyEmailField(previewPage);

        });

        await test.step("Step 4: verify count increments", async () => {

            await formPage.verifyVisitCountIncrease(context);
            await formPage.verifyStartCountIncrease(context);

        });

        await test.step("Step 5: verify submission count increment", async () => {

            await formPage.verifySubmissionCountIncrease(context);
        });

    });


})