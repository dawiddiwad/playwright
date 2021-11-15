import { expect } from '@playwright/test';
import { Details } from '../Details';
import { NavigationBar } from '../NavigationBar';
import { After, Before, BeforeAll } from "@cucumber/cucumber";
import { chromium, Page } from "@playwright/test";
import { SFDC } from "../SFDC";
import { Given, When, Then } from "@cucumber/cucumber";

const browserReady: Promise<Page> = chromium.launch({ headless: false })
    .then((chrome) => chrome.newContext()
        .then((ctx) => ctx.newPage()));

Before(() => {
    return SFDC.init();
})

Given("I Open Tasks home screen", { timeout: 120 * 1000 }, () => {
    return browserReady.then(async (page) => {
        const salesConsole = "Sales Console";
        await SFDC.login(page);
        await page.click(NavigationBar.appLauncherIcon, { delay: 2000 });
        await page.fill(NavigationBar.appLauncherSearch, salesConsole);
        await page.click(NavigationBar.selectApplication(salesConsole));
        await page.click(NavigationBar.tabsNavigationMenu, { delay: 2000 });
        await page.click(NavigationBar.tabsNavigationMenuItem("Tasks"));
    })
});

When("I select to view Overdue listview", () => {
    return browserReady.then(async (page) => {
        const overdueTasks = "Overdue Tasks";
        await page.click(Details.selectListViewButton);
        await page.click(Details.selectListViewItem(overdueTasks));
    })
});

Then("All overdue Tasks are displayed", async () => {
    return browserReady.then(async (page) => {
        const overdueTasks = "Overdue Tasks";
        const taskView = page.locator(`//li[descendant::*[contains(text(), '${overdueTasks}')]]`);
        await expect(taskView).toContainText(overdueTasks);
    })
});

After(() => {
    browserReady.then(async (page) => await SFDC.logout(page));
})

//node ./node_modules/.bin/cucumber-js ./tests/**/*.feature --require-module ts-node/register --quire 'support/**/*.ts' --publish