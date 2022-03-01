import { Page } from "@playwright/test";
import { Modal } from "./locators/Modal";
import { readFile } from "fs/promises";
import { DEVHUB_CREDENTIALS } from "../../sfdx-auth/tools/SandboxPreparator";
import { BASIC_CREDENTIALS, UsernamePasswordFetcher } from "../../sfdx-auth/tools/UsernamePasswordFetcher";

enum LoginInteruption {
    ConfirmIdentity = "LoginInterstitial",
    RegisterPhone = "AddPhoneNumber",
    ClassicContext = "my.salesforce.com"
}

export enum LoginFlow{
    Credentials,
    DevHub
}
export class SFDC_UI {
    public Ready: Promise<SFDC_UI>;
    public loginFlow: LoginFlow;
    private devHubCredentials: DEVHUB_CREDENTIALS;
    private basicCredentials: BASIC_CREDENTIALS;

    private isOn(page: Page, interuption: LoginInteruption): boolean {
        return page.url().includes(interuption);
    }

    private switchToLEX(): string {
        return `${this.devHubCredentials.baseUrl}/lightning/page/home`;
    }

    private async checkInteruptions(page: Page): Promise<void> {
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

    private getPasswordFor(username: string): string{
        let password: string;
        this.basicCredentials.sandboxes
            .forEach((sandbox) => {sandbox.users
                .forEach((user) => {
                    if (user.credentials.username === username){
                        password = user.credentials.password;
                    }
                })
            })
        if (!password){
            throw new Error(`unable to find password for username ${username}`);
        }
        return password;
    }

    private getBaseUrlFor(username: string): string{
        let baseUrl: string;
        this.basicCredentials.sandboxes
            .forEach((sandbox) => {sandbox.users
                .forEach((user) => {
                    if (user.credentials.username === username){
                        baseUrl = sandbox.baseUrl;
                    }
                })
            })
        if (!baseUrl){
            throw new Error(`unable to find baseUrl for username ${username}`);
        }
        return baseUrl;
    }

    private async initViaCredentialsFlow(): Promise<void>{
        this.basicCredentials = await UsernamePasswordFetcher.readFile();
    }

    private async initViaDevHubFlow(): Promise<void>{
        const storedCreds = JSON.parse((await readFile('./sfdx-auth/credentials.json')).toString())
        this.devHubCredentials = {
            orgId: String(storedCreds.orgId),
            loginUrl: String(storedCreds.loginUrl),
            username: String(storedCreds.username),
            baseUrl: String(storedCreds.baseUrl)
        };
    }

    constructor(loginFlow: LoginFlow){
        this.loginFlow = loginFlow;
        this.Ready = new Promise<SFDC_UI>(async (initialized, failed) =>{
            try {
                switch (loginFlow) {
                    case LoginFlow.Credentials:
                        await this.initViaCredentialsFlow();
                        initialized(this);
                        break;
                    case LoginFlow.DevHub:
                        await this.initViaDevHubFlow();
                        initialized(this);
                        break;
                }
            } catch(error) {
                console.error(`unable to initialize SFDC UI due to:\n${(error as Error).stack}`);
                failed(error);
            }
        })
    }

    public async login(page: Page): Promise<void> {
        if (this.loginFlow === LoginFlow.Credentials && !this.devHubCredentials.loginUrl){
            throw new Error("this method is not available for Credentials flow as it lacks login credentials");
        }
        await page.goto(this.devHubCredentials.loginUrl, {waitUntil: 'networkidle', timeout: 20000});
        await this.checkInteruptions(page);
    }

    public async loginUsingLoginPage(page: Page, username: string, password?: string): Promise<void> {
        if (this.loginFlow === LoginFlow.DevHub && this.devHubCredentials.loginUrl){
            throw new Error("this method is not available for DevHub flow as it lacks login credentials");
        }
        this.devHubCredentials = {baseUrl: this.getBaseUrlFor(username), username: username, orgId: null, loginUrl: null};
        await page.goto(this.devHubCredentials.baseUrl);
        await page.fill("//input[@id='username']", username);
        await page.fill("//input[@id='password']", password ? password : this.getPasswordFor(username));
        await page.click("//input[@id='Login']");
    }

    public async logout(page: Page): Promise<void> {
        await page.goto(`${this.devHubCredentials.baseUrl}/secur/logout.jsp`, {waitUntil: 'networkidle'});
    }
}
