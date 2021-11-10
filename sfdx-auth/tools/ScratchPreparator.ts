import { SandboxPreparator, SFDX_AUTH_URL } from "./SandboxPreparator";

export class ScratchPreparator extends SandboxPreparator {
    public Ready: Promise<ScratchPreparator>;
    private static DEFINITION_FILE_PATH: string = './salesforce-test-org/config/project-scratch-def.json';

    constructor(sfdxEnvPathVariable: string, authUrl: SFDX_AUTH_URL, repository?: string) {
        super(sfdxEnvPathVariable, authUrl, repository);

        this.Ready = new Promise(async (resolve, reject) => {
            try {
                await this.Ready;
                await this.prepare();
            } catch (e) {
                reject(`unable to get scratch org ready due to:\n${e}`)
            }
            resolve(this);
        });
    }

    private async prepare() {
        console.log("preparing scratch org...");
        let availOrgs: any = await this.sfdx.exec({
            cmd: 'force:org:list', f: ['--json'], log: true
        });
        if (availOrgs.scratchOrgs.length > 0){
            this.data = this.parseDefaultOrgDataFrom(availOrgs.scratchOrgs[0]);
        } else {
            try {
                await this.cloneRepository("develop", "salesforce-test-org");
                await this.create();
                await this.prepare();
            } catch (e) {
                console.error(`unable to prepare scratch org due to:\n${e}`);
            }
        }
    }

    private async create() {
        console.log(`Creating new scratch org under default dev hub ...`);
        await this.sfdx.exec({
            cmd: 'force:org:create',
            f: [
                `--definitionfile ${ScratchPreparator.DEFINITION_FILE_PATH}`,
                `--durationdays 1`,
                '--json',
            ],
            log: true
        });
    }

    public async generatePassword() {
        console.log(`Generating password for scratch org ${this.data.orgId} ...`);
        await this.sfdx.exec({
            cmd: 'force:user:password:generate',
            f: [
                `--targetusername ${this.data.username}`,
                `--json`
            ],
            log: true
        });
    }
}