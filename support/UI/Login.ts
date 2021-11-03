import { expect, Page } from "@playwright/test";

export class Login {
    private static username: string = 'test-atbow15lsqwf@example.com';
    private static password: string = 'apQ0h-skeakdb';
    static async toSfdc (page: Page): Promise<void> {
        await page.goto(`https://CS189.salesforce.com?un=${this.username}&pw=${this.password}`);
        if (await page.url().toString().includes("LoginInterstitial")){
            await page.click("//*[contains(@value, 'Continue')]");
        }
        if (await page.url().toString().includes("AddPhoneNumber")){
            await page.click("//*[contains(text(), 'Want to Register My Phone')]");
        }
    }
}