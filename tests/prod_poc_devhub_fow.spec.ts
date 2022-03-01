//@ts-check
import { SuccessResult } from "jsforce";
import { SFDC_API } from "../support/API/SFDC_API";
import { LoginFlow, SFDC_UI } from "../support/UI/SFDC_UI";

const { test, expect } = require('@playwright/test');
const { Details } = require('../support/UI/locators/Details');
const { NavigationBar } = require('../support/UI/locators/NavigationBar');
const { readFile } = require('fs/promises');

let api: SFDC_API;
let ui: SFDC_UI;

test.beforeAll(async () => {
    const credentials = JSON.parse((await readFile('sfdx-auth/api_credentials.json')).toString());
    api = await new SFDC_API({username: credentials.username, password: credentials.password}).Ready;
    ui = await new SFDC_UI(LoginFlow.DevHub).Ready;
})

test.describe.parallel('SFDC-prod-poc-devhub-flow', () => {
    test('Open Overdue Tasks listview -> Create -> Delete Task flow', async ({ page: sfdc }) => {
        test.slow();
        const salesConsole = "Sales Console";
        const overdueTasks = "Overdue Tasks";
        await ui.login(sfdc);        
        await sfdc.click(NavigationBar.appLauncherIcon, {delay:2000});
        await sfdc.fill(NavigationBar.appLauncherSearch, salesConsole);
        await sfdc.click(NavigationBar.selectApplication(salesConsole));
        await sfdc.click(NavigationBar.tabsNavigationMenu);
        await sfdc.click(NavigationBar.tabsNavigationMenuItem("Tasks"));
        await sfdc.click(Details.selectListViewButton);
        await sfdc.click(Details.selectListViewItem(overdueTasks));
        const taskView =  sfdc.locator(`//li[descendant::*[contains(text(), '${overdueTasks}')]]`);
        await expect(taskView).toContainText(overdueTasks);

        const taskSubject = "playwright poc tests"
        await sfdc.click("//a[contains(@title, 'action') and not(contains(@title, 'actions'))] | //ul[contains(@class, 'utilitybar')]");
        await sfdc.click(Details.newTaskButton);
        await sfdc.click("//a[ancestor::*[preceding-sibling::span[descendant::*[contains(text(), 'Status')]]]]");
        await sfdc.click(`//a[contains(@title, 'In Progress')]`);
        await sfdc.fill("//input[ancestor::*[preceding-sibling::label[contains(text(), 'Subject')]]]", taskSubject);
        await sfdc.click("//button[@title = 'Save']");
        const saveConfirmToast = sfdc.locator("//div[contains(@class, 'slds-notify--toast')]");
        await expect(saveConfirmToast).toContainText(`Task ${taskSubject} was created.`);

        await sfdc.click("(//li//a[contains(@title, 'actions')])");
        await sfdc.click("//a[contains(@title, 'Delete')]");
        const deleteConfirmationModal = {
            header: sfdc.locator("//div[contains(@class, 'modal-header')]"),
            body: sfdc.locator("//div[contains(@class, 'modal-body')]")
        }
        await expect(deleteConfirmationModal.header).toContainText('Delete Task');
        await expect(deleteConfirmationModal.body).toContainText('Are you sure you want to delete this task?');
        await sfdc.click("//button[descendant::span[contains(text(), 'Delete')]]");

        const deleteConfirmToast = sfdc.locator("//div[contains(@class, 'slds-notify--toast')]");
        await expect(deleteConfirmToast.first()).toContainText(`Task "${taskSubject}" was deleted.`);
        await ui.logout(sfdc);
    });

    test('Interact with LWC', async ({ page: sfdc }) => {
        test.slow();
        const appContext = "Sales";
        await ui.login(sfdc);  
        await sfdc.click("//button[descendant::*[contains(text(), 'App Launcher')]]", {delay:2000});
        await sfdc.fill("//input[contains(@type, 'search') and ancestor::one-app-launcher-menu]", appContext);
        await sfdc.click(`//one-app-launcher-menu-item[descendant::*[@*='${appContext}']]`);

        const lwcOutput = "//p[contains(text(), 'LWC')]";
        await expect(sfdc.locator(lwcOutput)).toContainText(`bardzo!`);

        const lwcInput = "a cypress jeszcze lepszy";
        await sfdc.fill("//input[ancestor::lightning-input[descendant::*[contains(text(),'Name')]]]", lwcInput);
        await expect(sfdc.locator(lwcOutput)).toContainText(`LWC zajebiste jest, ${lwcInput}!`);
        await ui.logout(sfdc);
    });

    test('Interact with shadowDom', async ({ page }) => {
        test.slow();

        await page.goto("https://recipes.lwc.dev/#hello");

        const shadowDomInputLocator = await page.locator("recipe-hello-expressions ui-input input").first();
        const lwcInput = "znalazłem!";
        await shadowDomInputLocator.first().scrollIntoViewIfNeeded();
        await shadowDomInputLocator.first().type(lwcInput);
        await expect(page.locator("recipe-hello-expressions ui-card div p")).toContainText(lwcInput.toUpperCase());
    });
    test('Interact with iframe', async ({ page }) => {
        test.slow();

        await page.goto("https://allwebco-templates.com/support/S_script_IFrame.htm");

        const elementHandle = await page.locator("//iframe[@name='Framename']").first().elementHandle();
        const frame = await elementHandle.contentFrame();

        await elementHandle.scrollIntoViewIfNeeded();
        await expect(frame.locator("//img")).toHaveAttribute('src', 'picts/iframe.jpg');
    });
    test('Create -> Delete Account flow via API', async() => {
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

