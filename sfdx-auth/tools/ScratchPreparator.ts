import { ORG, SandboxPreparator } from "./SandboxPreparator";

export class ScratchPreparator extends SandboxPreparator {
    public static DEFINITION_FILE_PATH: string = './salesforce-test-org/config/project-scratch-def.json';
    
    constructor(sfdxEnvPathVariable: string){
        super(sfdxEnvPathVariable);
    }

    public async create(devhubOrgId: string){
        console.log('Creating new scratch org...');
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
        })
    }
}