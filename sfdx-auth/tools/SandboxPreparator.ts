import { SFDX } from "./sfdx";
import { exec } from "child_process";
import { writeFile } from "fs/promises";
import { API_CREDENTIALS } from "../../support/API/SFAPI";

export enum ORG {
    SANDBOX,
    SCRATCH
}
export interface SFDX_AUTH_URL {
    url: string
}

export interface UI_CREDENTIALS {
    orgId: string,
    url: string,
    username: string,
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
    private repository: string;
    private branch: string;
    private apiCredentials?: API_CREDENTIALS;

    protected sfdx: SFDX;

    public Ready: Promise<SandboxPreparator>;
    public data: SANDBOX_DATA = {
        username: '', orgId: '', accessToken: '', instanceUrl: '',
        loginUrl: '', refreshToken: '', clientId: '', clientSecret: ''
    };

    private static AUTH_FILE_PATH: string = "./sfdx-auth/auth.json";
    private static CREDENTIALS_FILE_PATH: string = "./sfdx-auth/credentials.json";
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
            resolve(this);
        });
    }

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
                ]
            });
            this.data = this.parseDefaultOrgDataFrom(response);
        } catch (e) {
            throw new Error(`unable to authorize using auth url due to:\n${e}`);
        }
    }

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
        };
    }

    public async push() {
        console.log('pushing sources...');
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

    public async cloneRepository(): Promise<string> {
        console.log(`cloning ${this.branch} branch of repository ${this.repository} ...`);
        return new Promise<string>((repoCloned, failure) => {
            const gitClone = exec(`git clone --branch ${this.branch} "${this.repoUrl}/${this.repository}.git"`);
            gitClone.on('exit', (code) =>
                code !== 1 ? repoCloned('repository cloned sucesfully') : 'was not able to clone repository');
            gitClone.on('error', (error) =>
                failure(`unable to clone because of:\n${error}`));
        });
    }

    public async credentialsFile(data: UI_CREDENTIALS): Promise<UI_CREDENTIALS> {
        console.log("writing crednetials file...");
        await writeFile(SandboxPreparator.CREDENTIALS_FILE_PATH, JSON.stringify(data));
        if (this.apiCredentials && this.apiCredentials.password && this.apiCredentials.username){
            await writeFile(SandboxPreparator.API_CREDENTIALS_FILE_PATH, JSON.stringify(this.apiCredentials));
        }
        return data;
    }
}
