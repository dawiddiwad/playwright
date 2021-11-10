import { ScratchPreparator } from "./tools/ScratchPreparator";

const sfdxSystemPath: string = 'sfdx';
const scratchOrg: ScratchPreparator = new ScratchPreparator(sfdxSystemPath, {url: "force://PlatformCLI::5Aep861R85s7ZWXls0rEc6bm3J7cI4z8F10ckoY2BzSeqoHa6wIBeWhs0YjGkEfTB.DUNSTJK07JjHHwJOeOs1R@brave-wolf-qm0gmg-dev-ed.my.salesforce.com"});

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