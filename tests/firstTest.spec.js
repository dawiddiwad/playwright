const { test, expect } = require('@playwright/test');

$B = {};
$B.username = 'dawid89dobrowolski@brave-wolf-qm0gmg.com';
$B.password = 'Qwerty123';

test.describe.parallel('SFDC-poc', () => {
    test('Open Overdue Tasks listview -> Create -> Delete Task flow', async ({ page }) => {
        const appContext = "Sales Console";
        await page.goto(`https://login.salesforce.com?un=${$B.username}&pw=${$B.password}`);
        await page.click("//button[descendant::*[contains(text(), 'App Launcher')]]", {delay:2000});
        await page.type("//input[contains(@type, 'search') and ancestor::one-app-launcher-menu]", appContext);
        await page.click(`//one-app-launcher-menu-item[descendant::*[@*='${appContext}']]`);
        await page.click("//button[descendant::*[contains(text(), 'Show Navigation Menu')]]");
        await page.click("//li[contains(@class, 'listbox') and descendant::*[contains(text(), 'Tasks')]]");
        await page.click("//button[contains(@title, 'Select List View')]");
        await page.click("//li[descendant::*[contains(text(), 'Overdue Tasks')]]");
        const taskView =  page.locator("//li[descendant::*[contains(text(), 'Overdue Tasks')]]");
        await expect(taskView).toContainText("Overdue Tasks");

        const taskSubject = "playwright poc tests"
        await page.click("//a[contains(@title, 'action') and not(contains(@title, 'actions'))] | //ul[contains(@class, 'utilitybar')]");
        await page.click("//a[contains(@role, 'menuitem') and contains(@title, 'New Task')] | //div[contains(@title, 'New Task')]");
        await page.click("//a[ancestor::*[preceding-sibling::span[descendant::*[contains(text(), 'Status')]]]]");
        await page.click(`//a[contains(@title, 'In Progress')]`);
        await page.type("//input[ancestor::*[preceding-sibling::label[contains(text(), 'Subject')]]]", taskSubject);
        await page.click("//button[@title = 'Save']");
        const saveConfirmToast = page.locator("//div[contains(@class, 'slds-notify--toast')]");
        await expect(saveConfirmToast).toContainText(`Task ${taskSubject} was created.`);

        await page.click("(//li//a[contains(@title, 'actions')])");
        await page.click("//a[contains(@title, 'Delete')]");
        const deleteConfirmationModal = {
            header: page.locator("//div[contains(@class, 'modal-header')]"),
            body: page.locator("//div[contains(@class, 'modal-body')]")
        }
        await expect(deleteConfirmationModal.header).toContainText('Delete Task');
        await expect(deleteConfirmationModal.body).toContainText('Are you sure you want to delete this task?');
        await page.click("//button[descendant::span[contains(text(), 'Delete')]]");

        const deleteConfirmToast = page.locator("//div[contains(@class, 'slds-notify--toast')]");
        await expect(deleteConfirmToast.first()).toContainText(`Task "${taskSubject}" was deleted.`);
        await page.goto(`https://brave-wolf-qm0gmg-dev-ed.lightning.force.com/secur/logout.jsp`);
    });

    test('Interact with LWC', async ({ page }) => {
        const appContext = "Sales";
        await page.goto(`https://login.salesforce.com?un=${$B.username}&pw=${$B.password}`);
        await page.click("//button[descendant::*[contains(text(), 'App Launcher')]]", {delay:2000});
        await page.type("//input[contains(@type, 'search') and ancestor::one-app-launcher-menu]", appContext);
        await page.click(`//one-app-launcher-menu-item[descendant::*[@*='${appContext}']]`);

        const lwcOutput = page.locator("//p[contains(text(), 'LWC')]");
        await expect(lwcOutput).toContainText(`bardzo!`);

        const lwcInput = "a cypress jeszcze lepszy";
        await page.type("//input[ancestor::lightning-input[descendant::*[contains(text(),'Name')]]]", lwcInput, {delay: 50});
        await expect(lwcOutput).toContainText(`LWC zajebiste jest, ${lwcInput}bardzo!`);
        await page.goto(`https://brave-wolf-qm0gmg-dev-ed.lightning.force.com/secur/logout.jsp`);
    });

    test('Interact with iframe and shadowDom', async ({ page }) => {
        const appContext = "Sales";
        await page.goto(`https://login.salesforce.com?un=${$B.username}&pw=${$B.password}`);
        await page.click("//button[descendant::*[contains(text(), 'App Launcher')]]", { delay: 2000 });
        await page.type("//input[contains(@type, 'search') and ancestor::one-app-launcher-menu]", appContext);
        await page.click(`//one-app-launcher-menu-item[descendant::*[@*='${appContext}']]`);

        const elementHandle = await page.locator("//c-hello-world//iframe").elementHandle();
        const frame = await elementHandle.contentFrame();
        const shadowDomInputLocator = await frame.locator("recipe-hello-expressions ui-input input").first();

        const lwcInput = "znalazłem!";
        await shadowDomInputLocator.first().type(lwcInput);
        await expect(frame.locator("recipe-hello-expressions ui-card div p")).toContainText(lwcInput.toUpperCase());
    });
})

