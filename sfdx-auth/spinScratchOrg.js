const sfdx = require('sfdx-node');
const { exec } = require('child_process');

const auth = {
    "status": 0,
    "result": {
        "id": "00D0900000B27xBEAR",
        "accessToken": "00D0900000B27xB!ARYAQAGgcZmKqoLebpFwAXPZIwh3iI3EhzAwLaRIvoW80HSKIf9UNFsaulXwS0RVsKc8DxFpm2ehbN_uY5xrLWbZETLBbNx1",
        "instanceUrl": "https://brave-wolf-qm0gmg-dev-ed.my.salesforce.com",
        "username": "dawid89dobrowolski@brave-wolf-qm0gmg.com",
        "clientId": "PlatformCLI",
        "connectedStatus": "Connected",
        "sfdxAuthUrl": "force://PlatformCLI::5Aep861R85s7ZWXls0rEc6bm3J7cI4z8F10ckoY2BzSeqoHa6wIBeWhs0YjGkEfTB.DUNSTJK07JjHHwJOeOs1R@brave-wolf-qm0gmg-dev-ed.my.salesforce.com",
        "alias": "brave-wolf"
    }
}

function prepareOrg() {
    const gitClone = exec('git clone --branch develop  https://dawid89dobrowolski%40gmail.com:Dupa7890$@github.com/dawiddiwad/salesforce-test-org.git',
        (err, stdout, sterr) => {
            console.log(err);
            console.log(stdout);
            console.log(sterr);
        });
    gitClone.on('exit', () => spinOrg());
};

async function spinOrg(){
    // process.chdir('./salesforce-test-org');
    // await sfdx.auth.sfdxurl.store({f: auth});
    // const scratchOrg = await sfdx.force.org.create({
    //     _quiet: false,
    //     definitionfile: 'config/project-scratch-def.json',
    //     durationdays: 1,
    //     setalias: 'node-created'
    // });
    // await sfdx.force.source.push({
    //     _quiet: false,
    //     targetusername: scratchOrg.username
    // });
    // await sfdx.force.org.delete({
    //     _quiet: false,
    //     targetusername: scratchOrg.username,
    //     noprompt: true
    // }); 
    // console.log(await sfdx.force.org.list());
}

prepareOrg();







