import { expect, Page } from "@playwright/test";

export class Login {
    private static username: string = 'dawid89dobrowolski@brave-wolf-qm0gmg.com';
    private static password: string = 'Qwerty123';
    static async toSfdc (page: Page): Promise<void> {
        await page.goto(`https://login.salesforce.com?un=${this.username}&pw=${this.password}`, {waitUntil: "networkidle"});
        // await page.waitForEvent("framenavigated");
        if (await page.url.toString().includes("LoginInterstitial")){
            await page.click("//*[contains(@value, 'Continue')]");
        }
        // try {
        //     await page.click("//*[contains(@value, 'Continue')]", {timeout: 5000});
        // } catch(e){}
    }
}