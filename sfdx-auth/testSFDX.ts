import { SFDX } from "./tools/sfdx";

(async () => {
    try{
        console.log(await new SFDX('sfdx').exec({cmd: 'force:org:list', params: ['--json'], log: true}));
    } catch(e) {
        console.log(e);
    }
})()