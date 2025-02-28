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
        });

        await test.step("Step 5: Validate field errors", async () => {
            await formPage.validateFieldErrors(previewPage);
        });

        await test.step("Step 6: Fill and submit the form", async () => {
            await formPage.fillAndSubmitForm(previewPage, {
                firstName,
                lastName,
                email,
                phoneNumber
            });
        });

        await test.step("Step 7: Validate submission fields", async () => {
            await formPage.validateTheSubmissionFields(
                { formName },
                { firstName, lastName, email }
            );
        });
    });

})