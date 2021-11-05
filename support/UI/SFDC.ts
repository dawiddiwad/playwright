import { Page } from "@playwright/test";
import { Modal } from "./Modal";

enum LoginInteruption {
    ConfirmIdentity = "LoginInterstitial",
    RegisterPhone   = "AddPhoneNumber",
    ClassicContext  = "salesforce.com"
}

export class SFDC {
    private static loginUrl: string = 'https://CS89.salesforce.com';
    private static username: string = 'test-irocodf2ilgt@example.com';
    private static password: string = 'gysAebq0(bccs';
    public  static baseUrl:  string = 'https://business-app-7701-dev-ed.lightning.force.com';

    private static isOn(page: Page, interuption: LoginInteruption): boolean {
        return page.url().includes(interuption);
    }

    private static async checkInteruptions(page: Page): Promise<void> {
        if (this.isOn(page, LoginInteruption.ConfirmIdentity)){
            await page.click(Modal.identityConfirmContinueButton);
        }
        if (this.isOn(page, LoginInteruption.RegisterPhone)){
            await page.click(Modal.skipPhoneRegistrationLink);
        }
        if (this.isOn(page, LoginInteruption.ClassicContext)){
            await page.goto(this.baseUrl);
        }
    }

    public static async login (page: Page): Promise<void> {
        await page.goto(`${this.loginUrl}?un=${this.username}&pw=${this.password}`);
        await this.checkInteruptions(page);
    }

    public static async logout (page: Page): Promise<void> {
        await page.goto(`${this.baseUrl}/secur/logout.jsp`);
    }
}