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
    const sfdcModuleRepoLink = `"https://github.com/dawiddiwad/salesforce-test-org.git"`;
    const gitClone = exec(`git clone --branch develop  ${sfdcModuleRepoLink}`,
        (err, stdout, sterr) => {
            console.log(err);
            console.log(stdout);
            console.log(sterr);
        });
    gitClone.on('exit', () => spinOrg());
};

async function spinOrg(){
    process.chdir('./salesforce-test-org');
    const auth = await sfdx.auth.sfdxurl.store({
        _quiet: false,
        sfdxurlfile: '../sfdx-auth/auth.json',
        setdefaultdevhubusername: true,
        setdefaultusername: true
    });

    const orgList = await sfdx.force.org.list();
    let targetScratchOrg = null;

    if (orgList.scratchOrgs.lenght !== 0){
        targetScratchOrg = orgList.scratchOrgs[0];
    }

    targetScratchOrg = await sfdx.force.org.create({
        _quiet: false,
        _rejectOnError: true,
        definitionfile: 'config/project-scratch-def.json',
        durationdays: 1,
        setalias: 'node-created'
    }).catch((error) => console.log(error));

    if (targetScratchOrg){
        await sfdx.force.source.push({
            _quiet: false,
            forceoverwrite: true,
            targetusername: targetScratchOrg.username
        });
    } else {
        console.log("scracth org not created or none unavailable");
    }
    // await sfdx.force.org.delete({
    //     _quiet: false,
    //     targetusername: targetScratchOrg.username,
    //     noprompt: true
    // }); 
    console.log(await sfdx.force.org.list());
}

prepareOrg();







