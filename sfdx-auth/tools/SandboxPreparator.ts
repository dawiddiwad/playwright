import { SFDX } from "./SFDX";
import { writeFile } from "fs/promises";

interface SFDX_ACCESS_TOKEN {
    token: string
    instanceUrl: string
}

interface SFDX_AUTH_URL {
    url: string
}

export class SandboxPreparator {
    private static AUTH_FILE_PATH: string = "./sfdx-auth/auth.json";
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
        })
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
        })
    }
}