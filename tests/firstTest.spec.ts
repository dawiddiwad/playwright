//@ts-check
import { SuccessResult } from "jsforce";
import { SFDCapi } from "../support/API/SFAPI";
import { SFDC } from "../support/UI/SFUI";

const { test, expect } = require('@playwright/test');
const { Details } = require('../support/UI/Details');
const { NavigationBar } = require('../support/UI/NavigationBar');
const { readFile } = require('fs/promises');

let api: SFDCapi;

test.beforeAll(async () => {
    const credentials = JSON.parse((await readFile('sfdx-auth/api_credentials.json')).toString());
    api = await new SFDCapi({username: credentials.username, password: credentials.password}).Ready;
    await SFDC.init();
})

test.describe.parallel('SFDC-poc', () => {
    test.skip('Open Overdue Tasks listview -> Create -> Delete Task flow', async ({ page }) => {
        test.slow();
        const salesConsole = "Sales Console";
        const overdueTasks = "Overdue Tasks";
        await SFDC.login(page);        
        await page.click(NavigationBar.appLauncherIcon, {delay:2000});
        await page.fill(NavigationBar.appLauncherSearch, salesConsole);
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
        await page.fill("//input[ancestor::*[preceding-sibling::label[contains(text(), 'Subject')]]]", taskSubject);
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
        await SFDC.logout(page);
    });

    test.skip('Interact with LWC', async ({ page }) => {
        test.slow();
        const appContext = "Sales";
        await SFDC.login(page);
        await page.click("//button[descendant::*[contains(text(), 'App Launcher')]]", {delay:2000});
        await page.fill("//input[contains(@type, 'search') and ancestor::one-app-launcher-menu]", appContext);
        await page.click(`//one-app-launcher-menu-item[descendant::*[@*='${appContext}']]`);

        const lwcOutput = "//p[contains(text(), 'LWC')]";
        await expect(page.locator(lwcOutput)).toContainText(`bardzo!`);

        const lwcInput = "a cypress jeszcze lepszy";
        await page.fill("//input[ancestor::lightning-input[descendant::*[contains(text(),'Name')]]]", lwcInput);
        await expect(page.locator(lwcOutput)).toContainText(`LWC zajebiste jest, ${lwcInput}!`);
        await SFDC.logout(page);
    });

    test.skip('Interact with shadowDom', async ({ page }) => {
        test.slow();

        await page.goto("https://recipes.lwc.dev/#hello");

        const shadowDomInputLocator = await page.locator("recipe-hello-expressions ui-input input").first();
        const lwcInput = "znalazłem!";
        await shadowDomInputLocator.first().scrollIntoViewIfNeeded();
        await shadowDomInputLocator.first().type(lwcInput);
        await expect(page.locator("recipe-hello-expressions ui-card div p")).toContainText(lwcInput.toUpperCase());
    });
    test.skip('Interact with iframe', async ({ page }) => {
        test.slow();

        await page.goto("https://allwebco-templates.com/support/S_script_IFrame.htm");

        const elementHandle = await page.locator("//iframe[@name='Framename']").first().elementHandle();
        const frame = await elementHandle.contentFrame();

        await elementHandle.scrollIntoViewIfNeeded();
        await expect(frame.locator("//img")).toHaveAttribute('src', 'picts/iframe.jpg');
    });
    test.skip('Create -> Delete Account flow via API', async() => {
        const insertData = {
            Name: 'cucumber table',
            BillingCity: 'Piździszew dolny',
            Industry: 'Banking'
        }
        const account = await api.create('Account', insertData) as SuccessResult;
        const createdData = await api.read('Account', account.id);
        for (const field in insertData){
            expect(createdData[field]).toEqual(insertData[field]);
        }
        await api.delete('Account', account.id);
    })
    test('Create -> Delete Lead flow via API', async() => {
        const insertData = {
            Company: 'cucumber table',
            FirstName: 'Mariusz',
            LastName: 'Poczciwy',
            Status: 'Open - Not Contacted'
        }
        const lead = await api.create('Lead', insertData) as SuccessResult;
        const createdData = await api.read('Lead', lead.id);
        for (const field in insertData){
            expect(createdData[field]).toEqual(insertData[field]);
        }
        await api.delete('Lead', lead.id);
    })
})

