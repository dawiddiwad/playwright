import { SFDX } from "./sfdx";
import { exec } from "child_process";
import { writeFile } from "fs/promises";
<<<<<<< HEAD
=======
import { API_CREDENTIALS } from "../../support/API/SFAPI";
>>>>>>> master

export enum ORG {
    SANDBOX,
    SCRATCH
}
export interface SFDX_AUTH_URL {
    url: string
}

<<<<<<< HEAD
export interface SANDBOX_CREDENTIALS {
    loginUrl: string,
    username: string,
    password: string,
=======
export interface UI_CREDENTIALS {
    orgId: string,
    url: string,
    username: string,
>>>>>>> master
    baseUrl: string
}

export interface SANDBOX_DATA {
    username: string,
    orgId: string,
    accessToken: string,
    instanceUrl: string,
    loginUrl: string,
    refreshToken: string,
    clientId: string,
    clientSecret: string
}

export class SandboxPreparator {
    private repoUrl: string = "https://github.com/dawiddiwad";
<<<<<<< HEAD
    private repository: string | undefined;
=======
    private repository: string;
    private branch: string;
    private apiCredentials?: API_CREDENTIALS;
>>>>>>> master

    protected sfdx: SFDX;

    public Ready: Promise<SandboxPreparator>;
    public data: SANDBOX_DATA = {
        username: '', orgId: '', accessToken: '', instanceUrl: '',
        loginUrl: '', refreshToken: '', clientId: '', clientSecret: ''
    };

    private static AUTH_FILE_PATH: string = "./sfdx-auth/auth.json";
    private static CREDENTIALS_FILE_PATH: string = "./sfdx-auth/credentials.json";
<<<<<<< HEAD

    constructor(sfdxEnvPathVariable: string, authUrl: SFDX_AUTH_URL, repository?: string) {
        this.sfdx = new SFDX(sfdxEnvPathVariable);
        this.repository = repository;
        this.Ready = new Promise(async (resolve) => {
            await this.authorizeByAuthUrl(authUrl);
=======
    private static API_CREDENTIALS_FILE_PATH: string = "./sfdx-auth/api_credentials.json";

    constructor(sfdxEnvPathVariable: string, authUrl: SFDX_AUTH_URL, repository: string, branch: string, apiCredentials?: API_CREDENTIALS) {
        this.sfdx = new SFDX(sfdxEnvPathVariable);
        this.branch = branch;
        this.repository = repository;

        if (apiCredentials){
            this.apiCredentials = apiCredentials;
        }

        this.Ready = new Promise(async (resolve, reject) => {
            await this.authorizeByAuthUrl(authUrl)
                .catch((e) => reject(`unable to get sandbox ready due to:\n${e}`));
>>>>>>> master
            resolve(this);
        });
    }

<<<<<<< HEAD
    protected parseDefaultOrgDataFrom(authResponse: any): SANDBOX_DATA {
        console.log("preparing org data...");
        try {
            return {
                username: authResponse.username,
                orgId: authResponse.orgId,
                accessToken: authResponse.accessToken,
                instanceUrl: authResponse.instanceUrl,
                loginUrl: authResponse.loginUrl,
                refreshToken: authResponse.refreshToken,
                clientId: authResponse.clientId,
                clientSecret: authResponse.clientSecret
=======
    protected parseDefaultOrgDataFrom(data: any): SANDBOX_DATA {
        console.log("preparing org data...");
        try {
            return {
                username: data.username,
                orgId: data.orgId,
                accessToken: data.accessToken,
                instanceUrl: data.instanceUrl,
                loginUrl: data.loginUrl,
                refreshToken: data.refreshToken,
                clientId: data.clientId,
                clientSecret: data.clientSecret
>>>>>>> master
            };
        } catch (error) {
            throw new Error(`unable to parse sandbox data due to:\n${error}`);
        }
    }

    public async authorizeByAuthUrl(access: SFDX_AUTH_URL): Promise<void> {
        console.log('Authorizing SFDX via auth url...');
        try {
            await writeFile(SandboxPreparator.AUTH_FILE_PATH, `{"sfdxAuthUrl": "${access.url}"}`);
            const response: any = await this.sfdx.exec({
                cmd: 'auth:sfdxurl:store',
                f: [
                    `--sfdxurlfile ${SandboxPreparator.AUTH_FILE_PATH}`,
                    '--setdefaultdevhubusername',
                    '--setdefaultusername',
                    '--json'
<<<<<<< HEAD
                ],
                log: true
=======
                ]
>>>>>>> master
            });
            this.data = this.parseDefaultOrgDataFrom(response);
        } catch (e) {
            throw new Error(`unable to authorize using auth url due to:\n${e}`);
        }
    }

<<<<<<< HEAD
    public async fetchCredentials(username?: string): Promise<SANDBOX_CREDENTIALS> {
        username = username ? username : this.data.username; 
        console.log(`fetching credentials for org ${username}...`);

        let orgData: any = await this.sfdx.exec({
            cmd: 'force:org:display',
            f: [
                `--targetusername ${username}`,
                '--json'
            ],
            log: true
        });

        return {
            loginUrl: this.data.loginUrl,
            username: username,
            password: orgData.password,
            baseUrl: orgData.instanceUrl,
=======
    public async fetchCredentials(username?: string): Promise<UI_CREDENTIALS> {
        username = username ? username : this.data.username; 
        console.log(`fetching credentials for ${username}...`);

        let credentials: any = await this.sfdx.exec({
            cmd: 'force:org:open',
            f: [
                `--targetusername ${username}`,
                '--urlonly',
                '--json'
            ]
        });

        return {
            orgId: credentials.orgId,
            url: credentials.url,
            username: credentials.username,
            baseUrl: this.data.instanceUrl
>>>>>>> master
        };
    }

    public async push() {
        console.log('pushing sources...');
<<<<<<< HEAD
        if (!this.repository){
            throw new Error("no repository set");
        }
=======
>>>>>>> master
        process.chdir(`./${this.repository}`);
        await this.sfdx.exec({
            cmd: 'force:source:push',
            f: [
                `--targetusername ${this.data.username}`,
                `--forceoverwrite`,
                `--json`
            ],
            log: true
        });
        process.chdir('../');
    }

<<<<<<< HEAD
    public async cloneRepository(branch: string, repository?: string): Promise<string> {
        console.log(`cloning ${branch} branch of repository ${repository} ...`);

        if (!repository && !this.repository){
            throw new Error("no repository set");
        } else if (!repository) {
            repository = this.repository;
        } else {
            this.repository = repository;
        }

        return new Promise<string>((repoCloned, failure) => {
            const gitClone = exec(`git clone --branch ${branch} "${this.repoUrl}/${repository}.git"`);
=======
    public async cloneRepository(): Promise<string> {
        console.log(`cloning ${this.branch} branch of repository ${this.repository} ...`);
        return new Promise<string>((repoCloned, failure) => {
            const gitClone = exec(`git clone --branch ${this.branch} "${this.repoUrl}/${this.repository}.git"`);
>>>>>>> master
            gitClone.on('exit', (code) =>
                code !== 1 ? repoCloned('repository cloned sucesfully') : 'was not able to clone repository');
            gitClone.on('error', (error) =>
                failure(`unable to clone because of:\n${error}`));
        });
    }

<<<<<<< HEAD
    public async credentialsFile(data: SANDBOX_CREDENTIALS): Promise<SANDBOX_CREDENTIALS> {
        console.log("writing crednetials file...");
        await writeFile(SandboxPreparator.CREDENTIALS_FILE_PATH, JSON.stringify(data));
=======
    public async credentialsFile(data: UI_CREDENTIALS): Promise<UI_CREDENTIALS> {
        console.log("writing crednetials file...");
        await writeFile(SandboxPreparator.CREDENTIALS_FILE_PATH, JSON.stringify(data));
        if (this.apiCredentials && this.apiCredentials.password && this.apiCredentials.username){
            await writeFile(SandboxPreparator.API_CREDENTIALS_FILE_PATH, JSON.stringify(this.apiCredentials));
        }
>>>>>>> master
        return data;
    }
}
