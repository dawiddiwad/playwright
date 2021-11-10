import { ORG, SandboxPreparator } from "./tools/SandboxPreparator";
import { ScratchPreparator } from "./tools/ScratchPreparator";
import { SFDX } from "./tools/sfdx";

const sfdxSystemPath: string = 'sfdx';

const sfdx: SFDX = new SFDX(sfdxSystemPath);
const sandbox: SandboxPreparator = new SandboxPreparator(sfdxSystemPath);
const scratchOrg: ScratchPreparator = new ScratchPreparator(sfdxSystemPath);

(async () => {
    try{
        await sfdx.exec({cmd: 'force:org:list', f: ['--json'], log: true});
        await sandbox.cloneRepository("https://github.com/dawiddiwad/salesforce-test-org.git", "develop")
        await sandbox.fetchCredentialsOf('00D0900000B27xBEAR', ORG.SANDBOX);
        await scratchOrg.generatePassword("00D0900000B27xBEAR", "00D7a0000005AGHEA2");
        await scratchOrg.pushSourceTo("test-3z0gdjoptdv7@example.com");   
        await scratchOrg.createUnder("00D0900000B27xBEAR");          
    } catch(e) {
        console.log(e);
    }
})()