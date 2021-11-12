import { SandboxPreparator, SFDX_AUTH_URL } from "./SandboxPreparator";

export class ScratchPreparator extends SandboxPreparator {
    public Ready: Promise<ScratchPreparator>;
    private static DEFINITION_FILE_PATH: string = './salesforce-test-org/config/project-scratch-def.json';

    constructor(sfdxEnvPathVariable: string, authUrl: SFDX_AUTH_URL, repository: string, branch: string) {
        super(sfdxEnvPathVariable, authUrl, repository, branch);

        this.Ready = new Promise(async (resolve, reject) => {
            try {
                await this.Ready;
                await this.cloneRepository();
                await this.prepare();
                resolve(this);
            } catch (error) {
                reject(`unable to get scratch org ready due to:\n${error}`);
            }
        });
    }

    private async prepare(): Promise<void> {
        console.log("preparing scratch org...");
        try {
            let availOrgs: any = await this.sfdx.exec({
                cmd: 'force:org:list', f: ['--json']
            });
            if (availOrgs.scratchOrgs.length > 0) {
                this.data = this.parseDefaultOrgDataFrom(availOrgs.scratchOrgs[0]);
            } else {
                await this.create();
                await this.prepare();
            }
        } catch (error) {
            console.error(`unable to prepare scratch org due to:\n${error}`);
            process.exit(1);
        }
    }

    private async create(): Promise<void> {
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

    public async generatePassword(): Promise<void> {
        console.log(`Generating password for scratch org ${this.data.orgId} ...`);
        await this.sfdx.exec({
            cmd: 'force:user:password:generate',
            f: [
                `--targetusername ${this.data.username}`,
                `--json`
            ]
        });
    }
}