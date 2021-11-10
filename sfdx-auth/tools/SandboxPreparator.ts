import { SFDX } from "./sfdx";
import { exec } from "child_process";
import { writeFile } from "fs/promises";

export enum ORG {
    SANDBOX,
    SCRATCH
}
interface SFDX_ACCESS_TOKEN {
    token: string
    instanceUrl: string
}

interface SFDX_AUTH_URL {
    url: string
}

interface SANDBOX_CREDENTIALS {
    loginUrl: string,
    username: string,
    password: string,
    baseUrl: string
}

export class SandboxPreparator {
    private static AUTH_FILE_PATH: string = "./sfdx-auth/auth.json";
    private static CREDENTIALS_FILE_PATH: string = "./sfdx-auth/credentials.json";
    protected sfdx: SFDX;

    constructor(sfdxEnvPathVariable: string) {
        this.sfdx = new SFDX(sfdxEnvPathVariable);
    }

    public async authorizeByToken(access: SFDX_ACCESS_TOKEN): Promise<SandboxPreparator> {
        console.log('Authorizing SFDX via token...');
        process.env['SFDX_ACCESS_TOKEN'] = access.token;
        await this.sfdx.exec({
            cmd: 'auth:accesstoken:store',
            f: [
                `--instanceurl ${access.instanceUrl}`,
                '--noprompt',
                '--json'
            ],
            log: true
        });
        return this;
    }

    public async authorizeByAuthUrl(access: SFDX_AUTH_URL): Promise<SandboxPreparator> {
        console.log('Authorizing SFDX via auth url...');
        await writeFile(SandboxPreparator.AUTH_FILE_PATH, `{"sfdxAuthUrl": "${access.url}"}`);
        await this.sfdx.exec({
            cmd: 'auth:sfdxurl:store',
            f: [
                `--sfdxurlfile ${SandboxPreparator.AUTH_FILE_PATH}`,
                '--json'
            ],
            log: true
        });
        return this;
    }

    public async fetchCredentialsOf(orgId: string, type: ORG ): Promise<SANDBOX_CREDENTIALS> {
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

    public async pushSourceTo(orgUsername: string) {
        console.log('pushing sources...');
        process.chdir('./salesforce-test-org');
        await this.sfdx.exec({
            cmd: 'force:source:push',
            f: [
                `--targetusername ${orgUsername}`,
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