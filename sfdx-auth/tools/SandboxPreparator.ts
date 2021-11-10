import { SFDX } from "./sfdx";
import { exec } from "child_process";
import { writeFile } from "fs/promises";

export enum ORG {
    SANDBOX,
    SCRATCH
}
export interface SFDX_AUTH_URL {
    url: string
}

export interface SANDBOX_CREDENTIALS {
    loginUrl: string,
    username: string,
    password: string,
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
    private repository: string | undefined;

    protected sfdx: SFDX;

    public Ready: Promise<SandboxPreparator>;
    public data: SANDBOX_DATA = {
        username: '', orgId: '', accessToken: '', instanceUrl: '',
        loginUrl: '', refreshToken: '', clientId: '', clientSecret: ''
    };

    private static AUTH_FILE_PATH: string = "./sfdx-auth/auth.json";
    private static CREDENTIALS_FILE_PATH: string = "./sfdx-auth/credentials.json";

    constructor(sfdxEnvPathVariable: string, authUrl: SFDX_AUTH_URL, repository?: string) {
        this.sfdx = new SFDX(sfdxEnvPathVariable);
        this.repository = repository;
        this.Ready = new Promise(async (resolve, reject) => {
            await this.authorizeByAuthUrl(authUrl)
                .catch((e) => reject(`unable to get sandbox ready due to:\n${e}`));
            resolve(this);
        });
    }

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
                ],
                log: true
            });
            this.data = this.parseDefaultOrgDataFrom(response);
        } catch (e) {
            throw new Error(`unable to authorize using auth url due to:\n${e}`);
        }
    }

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
        };
    }

    public async push() {
        console.log('pushing sources...');
        if (!this.repository){
            throw new Error("no repository set");
        }
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
            gitClone.on('exit', (code) =>
                code !== 1 ? repoCloned('repository cloned sucesfully') : 'was not able to clone repository');
            gitClone.on('error', (error) =>
                failure(`unable to clone because of:\n${error}`));
        });
    }

    public async credentialsFile(data: SANDBOX_CREDENTIALS): Promise<SANDBOX_CREDENTIALS> {
        console.log("writing crednetials file...");
        await writeFile(SandboxPreparator.CREDENTIALS_FILE_PATH, JSON.stringify(data));
        return data;
    }
}
