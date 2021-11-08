import { SFDX } from "./tools/sfdx";

const sfdx = new SFDX('sfdx');

(async () => {
    try{
        await sfdx.exec({cmd: 'force:org:list', f: ['--json'], log: true});
    } catch(e) {
        console.log(e);
    }
})()