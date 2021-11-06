import { Page } from "@playwright/test";
import { Modal } from "./Modal";
import { readFile } from "fs";

enum LoginInteruption {
    ConfirmIdentity = "LoginInterstitial",
    RegisterPhone = "AddPhoneNumber",
    ClassicContext = "salesforce.com"
}
export class SFDC {
    private static loginUrl: string = '';
    private static username: string = '';
    private static password: string = '';
    public static baseUrl: string = '';
    public static baseLexUrl: string = this.baseUrl ? this.baseUrl.replace('my.salesforce.com', 'lightning.force.com') : null;

    private static isOn(page: Page, interuption: LoginInteruption): boolean {
        return page.url().includes(interuption);
    }

    private static async checkInteruptions(page: Page): Promise<void> {
        if (this.isOn(page, LoginInteruption.ConfirmIdentity)) {
            await page.click(Modal.identityConfirmContinueButton);
        }
        if (this.isOn(page, LoginInteruption.RegisterPhone)) {
            await page.click(Modal.skipPhoneRegistrationLink);
        }
        if (this.isOn(page, LoginInteruption.ClassicContext)) {
            await page.goto(this.baseLexUrl);
        }
    }

    public static async init(): Promise<void> {
        return readFile('./sfdx-auth/credentials.json', (error, data: any) => {
            if (error) { 
                throw new Error(`unable to read credentials.json due to:\n${error.message}`); 
            }
            console.log('fetched credentials.json');
            data = JSON.parse(data.toString());
            console.log(JSON.stringify(data));
            this.loginUrl = data.loginUrl;
            this.username = data.username;
            this.password = data.password;
            this.baseUrl = data.baseUrl;
        })
    }

    public static async login(page: Page): Promise<void> {
        await page.goto(`${this.loginUrl}?un=${this.username}&pw=${this.password}`);
        await this.checkInteruptions(page);
    }

    public static async logout(page: Page): Promise<void> {
        await page.goto(`${this.baseUrl}/secur/logout.jsp`);
    }
}