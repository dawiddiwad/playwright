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
    username: string;
    orgId: string;
    accessToken: string;
    instanceUrl: string;
    loginUrl: string;
    refreshToken: string;
    clientId: string;
    clientSecret: string;
}

export class SandboxPreparator {
    protected sfdx: SFDX;

    public Ready: Promise<SandboxPreparator>;
    public data: SANDBOX_DATA = { username: '', orgId: '', accessToken: '', instanceUrl: '', 
        loginUrl: '', refreshToken: '', clientId: '', clientSecret: ''};

    private static AUTH_FILE_PATH: string = "./sfdx-auth/auth.json";
    private static CREDENTIALS_FILE_PATH: string = "./sfdx-auth/credentials.json";

    constructor (sfdxEnvPathVariable: string, authUrl: SFDX_AUTH_URL){
        this.sfdx = new SFDX(sfdxEnvPathVariable);
        this.Ready = new Promise<SandboxPreparator>(async (ready) => {
            const result = await this.authorizeByAuthUrl(authUrl);
            ready(this);
        });
    }


    protected parseDefaultOrgDataFrom(authResponse: any): SANDBOX_DATA {
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

    public async fetchCredentialsOf(orgId: string, type: ORG): Promise<SANDBOX_CREDENTIALS> {
        console.log('fetching org credentials...');
        let availOrgs: any = await this.sfdx.exec({
            cmd: 'force:org:list', f: ['--json']
        });
        const allOrgs = availOrgs;

        const matchById = (org: any) => org.orgId === orgId;
        if (type === ORG.SANDBOX && availOrgs.nonScratchOrgs) {
            availOrgs = availOrgs.nonScratchOrgs.filter(matchById);
        } else if (type === ORG.SCRATCH && availOrgs.scratchOrgs) {
            availOrgs = availOrgs.scratchOrgs.filter(matchById);
        } else {
            throw new Error(`no orgs found in:\n${JSON.stringify(availOrgs)}`);
        }

        if (availOrgs.length !== 0) {
            const credentials: SANDBOX_CREDENTIALS = {
                loginUrl: availOrgs[0].loginUrl,
                username: availOrgs[0].username,
                password: availOrgs[0].password,
                baseUrl: availOrgs[0].baseUrl,
            };
            return credentials;
        } else {
            throw new Error(`no matching orgs found in:\n${JSON.stringify(allOrgs)}`);
        }
    }

    public async push() {
        console.log('pushing sources...');
        process.chdir('./salesforce-test-org');
        await this.sfdx.exec({
            cmd: 'force:source:push',
            f: [
                `--targetusername ${this.data.username}`,
                `--forceoverwrite`,
                `--json`
            ],
            log: true
        })
        process.chdir('../');
    }

    public async cloneRepository(repoUrl: string, branch: string): Promise<string> {
        console.log(`cloning ${branch} branch of repository ${repoUrl} ...`);
        return new Promise<string>((repoCloned, failure) => {
            const gitClone = exec(`git clone --branch ${branch} ${repoUrl}`);
            gitClone.on('exit', (code) =>
                code !== 1 ? repoCloned('repository cloned sucesfully') : 'was not able to clone repository');
            gitClone.on('error', (error) =>
                failure(`unable to clone because of:\n${error}`));
        })
    }

    public async credentialsFile(data: SANDBOX_CREDENTIALS): Promise<SANDBOX_CREDENTIALS> {
        await writeFile(SandboxPreparator.CREDENTIALS_FILE_PATH, JSON.stringify(data));
        return data;
    }
}
