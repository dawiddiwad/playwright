import { SFDX } from "./sfdx";
import { writeFile } from "fs/promises";

interface SFDX_ACCESS_TOKEN {
    token       : string
    instanceUrl : string
}

interface SFDX_AUTH_URL {
    url : string
}

interface SANDBOX_CREDENTIALS {
    loginUrl : string,
    username : string,
    password : string,
    baseUrl  : string
}

export class SandboxPreparator {
    private static AUTH_FILE_PATH        : string = "./sfdx-auth/auth.json";
    private static CREDENTIALS_FILE_PATH : string = "./sfdx-auth/credentials.json";
    private sfdx: SFDX;

    constructor(sfdxEnvPathVariable: string) {
        this.sfdx = new SFDX(sfdxEnvPathVariable);
    }

    public async authorizeByToken(access: SFDX_ACCESS_TOKEN) {
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
    }

    public async authorizeByAuthUrl(access: SFDX_AUTH_URL) {
        await writeFile(SandboxPreparator.AUTH_FILE_PATH,`{"sfdxAuthUrl": "${access.url}"}`);
        await this.sfdx.exec({
            cmd: 'auth:sfdxurl:store',
            f: [
                `--sfdxurlfile ${SandboxPreparator.AUTH_FILE_PATH}`,
                '--json'
            ],
            log: true
        });
    }

    public async generateCredentials(username: string, password: string) : Promise<SANDBOX_CREDENTIALS> {
        const orgsList: any = await this.sfdx.exec({
            cmd: 'force:org:list',
            f: [
                '--json'
            ]
        });

        let targetOrg: any;
        if (orgsList.nonScratchOrgs){
            const matchUsername = (org: any) => org.username === username;
            targetOrg = orgsList.nonScratchOrgs;
            targetOrg.filter(matchUsername);
        } else {
            throw new Error(`nonScratchOrgs not found in ${JSON.stringify(orgsList)}`);
        }

        if (targetOrg.length > 0){
            const credentials : SANDBOX_CREDENTIALS = {
                loginUrl : targetOrg[0].loginUrl,
                username : username,
                password : password,
                baseUrl  : targetOrg[0].baseUrl,
            };
            await writeFile(SandboxPreparator.CREDENTIALS_FILE_PATH, JSON.stringify(credentials));
            return credentials;
        } else {
            throw new Error(`nonScratchOrgs not found in ${JSON.stringify(targetOrg)}`);
        }
    }
}