//@ts-check

const { test, expect } = require('@playwright/test');
const { Details } = require('../support/UI/Details');
const { NavigationBar } = require('../support/UI/NavigationBar');

class $B {}
$B.username = 'dawid89dobrowolski@brave-wolf-qm0gmg.com';
$B.password = 'Qwerty123';


test.describe.parallel('SFDC-poc', () => {
    test('Open Overdue Tasks listview -> Create -> Delete Task flow', async ({ page }) => {
        test.slow();
        const salesConsole = "Sales Console";
        const overdueTasks = "Overdue Tasks";
        await page.goto(`https://login.salesforce.com?un=${$B.username}&pw=${$B.password}`, { waitUntil: "networkidle" });
        await page.click(NavigationBar.appLauncherIcon, {delay:2000});
        await page.type(NavigationBar.appLauncherSearch, salesConsole);
        await page.click(NavigationBar.selectApplication(salesConsole));
        await page.click(NavigationBar.tabsNavigationMenu);
        await page.click(NavigationBar.tabsNavigationMenuItem("Tasks"));
        await page.click(Details.selectListViewButton);
        await page.click(Details.selectListViewItem(overdueTasks));
        const taskView =  page.locator(`//li[descendant::*[contains(text(), '${overdueTasks}')]]`);
        await expect(taskView).toContainText(overdueTasks);

        const taskSubject = "playwright poc tests"
        await page.click("//a[contains(@title, 'action') and not(contains(@title, 'actions'))] | //ul[contains(@class, 'utilitybar')]");
        await page.click(Details.newTaskButton);
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
        test.slow();
        const appContext = "Sales";
        await page.goto(`https://login.salesforce.com?un=${$B.username}&pw=${$B.password}`, { waitUntil: "networkidle" });
        await page.click("//button[descendant::*[contains(text(), 'App Launcher')]]", {delay:2000});
        await page.type("//input[contains(@type, 'search') and ancestor::one-app-launcher-menu]", appContext);
        await page.click(`//one-app-launcher-menu-item[descendant::*[@*='${appContext}']]`);

        const lwcOutput = "//p[contains(text(), 'LWC')]";
        await expect(page.locator(lwcOutput)).toContainText(`bardzo!`);

        const lwcInput = "a cypress jeszcze lepszy";
        await page.type("//input[ancestor::lightning-input[descendant::*[contains(text(),'Name')]]]", lwcInput, { noWaitAfter: false });
        await expect(page.locator(lwcOutput)).toContainText(`LWC zajebiste jest, ${lwcInput}bardzo!`);
        await page.goto(`https://brave-wolf-qm0gmg-dev-ed.lightning.force.com/secur/logout.jsp`);
    });

    test('Interact with iframe and shadowDom', async ({ page }) => {
        test.slow();
        const appContext = "Sales";
        await page.goto(`https://login.salesforce.com?un=${$B.username}&pw=${$B.password}`, { waitUntil: "networkidle" });
        await page.click("//button[descendant::*[contains(text(), 'App Launcher')]]", { delay: 2000 });
        await page.type("//input[contains(@type, 'search') and ancestor::one-app-launcher-menu]", appContext);
        await page.click(`//one-app-launcher-menu-item[descendant::*[@*='${appContext}']]`);

        const elementHandle = await page.locator("//c-hello-world//iframe").elementHandle();
        const frame = await elementHandle.contentFrame();
        const shadowDomInputLocator = await frame.locator("recipe-hello-expressions ui-input input").first();

        const lwcInput = "znalazłem!";
        await shadowDomInputLocator.first().scrollIntoViewIfNeeded();
        await shadowDomInputLocator.first().type(lwcInput);
        await expect(frame.locator("recipe-hello-expressions ui-card div p")).toContainText(lwcInput.toUpperCase());
        await page.goto(`https://brave-wolf-qm0gmg-dev-ed.lightning.force.com/secur/logout.jsp`);
    });
})

