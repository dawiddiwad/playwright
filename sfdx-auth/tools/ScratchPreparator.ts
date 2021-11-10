import { ORG, SandboxPreparator } from "./SandboxPreparator";

export class ScratchPreparator extends SandboxPreparator {
    public static DEFINITION_FILE_PATH: string = './salesforce-test-org/config/project-scratch-def.json';
    
    constructor(sfdxEnvPathVariable: string){
        super(sfdxEnvPathVariable);
    }

    public async createUnder(devhubOrgId: string){
        console.log(`Creating new scratch org under dev hub ${devhubOrgId} ...`);
        await this.sfdx.exec({
            cmd: 'force:org:create',
            f: [
                `--targetdevhubusername ${
                    await this
                    .fetchCredentialsOf(devhubOrgId, ORG.SANDBOX)
                    .then((credentials) => credentials.username)
                }`,
                `--definitionfile ${ScratchPreparator.DEFINITION_FILE_PATH}`,
                `--durationdays 1`,
                '--json',
            ],
            log: true
        });
    }

    public async generatePassword(devhubOrgId: string, scratchOrgId: string){
        console.log(`Generating password for scratch org ${scratchOrgId} ...`);
        await this.sfdx.exec({
            cmd: 'force:user:password:generate',
            f: [
                `--targetdevhubusername ${
                    await this
                    .fetchCredentialsOf(devhubOrgId, ORG.SANDBOX)
                    .then((credentials) => credentials.username)
                }`,
                `--targetusername ${
                    await this
                    .fetchCredentialsOf(scratchOrgId, ORG.SCRATCH)
                    .then((credentials) => credentials.username)
                }`,
                `--json`
            ],
            log: true
        });
    }
}