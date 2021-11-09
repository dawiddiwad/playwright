import { ORG, SandboxPreparator } from "./tools/SandboxPreparator";
import { ScratchOrg } from "./tools/ScratchOrg";
import { SFDX } from "./tools/sfdx";

const sfdx = new SFDX('sfdx');

(async () => {
    try{
        await sfdx.exec({cmd: 'force:org:list', f: ['--json'], log: true});
        await new SandboxPreparator('sfdx')
            .fetchCredentialsOf('00D0900000B27xBEAR', ORG.SANDBOX);
        await new ScratchOrg('sfdx')
            .create("00D0900000B27xBEAR");          
    } catch(e) {
        console.log(e);
    }
})()