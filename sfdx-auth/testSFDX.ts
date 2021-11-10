import { ScratchPreparator } from "./tools/ScratchPreparator";

const sfdxSystemPath: string = 'sfdx';
const scratchOrg: ScratchPreparator = new ScratchPreparator(sfdxSystemPath, {url: "***"});

(async () => {
    try{
        await scratchOrg.Ready.then(async (org) => {
            await org.cloneRepository("develop", "salesforce-test-org");
            await org.generatePassword();
            await org.push();      
        })   
    } catch(e) {
        console.log(e);
    }
})()