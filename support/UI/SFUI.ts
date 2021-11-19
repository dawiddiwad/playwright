import { Page } from "@playwright/test";
import { Modal } from "./Modal";
import { readFile } from "fs";
import { SANDBOX_CREDENTIALS } from "../../sfdx-auth/tools/SandboxPreparator";

enum LoginInteruption {
    ConfirmIdentity = "LoginInterstitial",
    RegisterPhone = "AddPhoneNumber",
    ClassicContext = "my.salesforce.com"
}
export class SFDC {
    private static credentials: SANDBOX_CREDENTIALS;

    private static isOn(page: Page, interuption: LoginInteruption): boolean {
        return page.url().includes(interuption);
    }

    private static switchToLEX(): string {
        return `${this.credentials.baseUrl}/lightning/page/home`;
    }

    private static async checkInteruptions(page: Page): Promise<void> {
        if (this.isOn(page, LoginInteruption.ConfirmIdentity)) {
            await page.click(Modal.identityConfirmContinueButton);
        }
        if (this.isOn(page, LoginInteruption.RegisterPhone)) {
            await page.click(Modal.skipPhoneRegistrationLink);
        }
        if (this.isOn(page, LoginInteruption.ClassicContext)) {
            await page.goto(this.switchToLEX(), {waitUntil: 'networkidle', timeout: 20000});
        }
    }

    public static async init(): Promise<void> {
        return readFile('./sfdx-auth/credentials.json', (error, data: any) => {
            if (error) { 
                throw new Error(`unable to read credentials.json due to:\n${error.message}`); 
            }
            data = JSON.parse(data.toString());
            this.credentials = {
                orgId: String(data.orgId),
                url: String(data.url),
                username: String(data.username),
                baseUrl: String(data.baseUrl)
            }
        })
    }

    public static async login(page: Page): Promise<void> {
        await page.goto(this.credentials.url, {waitUntil: 'networkidle', timeout: 20000});
        await this.checkInteruptions(page);
    }

    public static async logout(page: Page): Promise<void> {
        await page.goto(`${this.credentials.baseUrl}/secur/logout.jsp`, {waitUntil: 'networkidle'});
    }
}
