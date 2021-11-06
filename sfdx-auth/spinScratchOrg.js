const fs = require('fs');
const sfdx = require('sfdx-node');
const { exec } = require('child_process');

const branch = 'develop';
const repo = 'salesforce-test-org';
const sfdcModuleRepoLink = `"https://github.com/dawiddiwad/${repo}.git"`;

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

async function prepareOrg() {
    await fs.writeFile('sfdx-auth/auth.json', process.argv[2], err => {
        console.log(err ? err : 'auth.json saved');
    })
    const gitClone = exec(`git clone --branch ${branch} ${sfdcModuleRepoLink}`,
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

    if (orgList.scratchOrgs.length !== 0){
        targetScratchOrg = orgList.scratchOrgs[0];
        orgList.scratchOrgs.forEach(scratchOrg => {
            if (scratchOrg.alias === repo){
                targetScratchOrg = scratchOrg;
            }
        });
    }

    targetScratchOrg ? targetScratchOrg : await sfdx.force.org.create({
        _quiet: false,
        _rejectOnError: true,
        definitionfile: 'config/project-scratch-def.json',
        targetdevhubusername: auth.username, 
        durationdays: 1,
        setalias: repo
    }).catch((error) => console.log(error));

    if (targetScratchOrg){
        await sfdx.force.source.push({
            _quiet: false,
            forceoverwrite: true,
            targetusername: targetScratchOrg.username
        });
        if (!targetScratchOrg.password){
            targetScratchOrg.password = await sfdx.force.user.passwordGenerate({
                _quiet: false,
                targetusername: targetScratchOrg.username
            }).password;
        }
        const credentials = {
            loginUrl: targetScratchOrg.loginUrl,
            username: targetScratchOrg.username,
            password: targetScratchOrg.password,
            baseUrl: targetScratchOrg.instanceUrl
        }
        await fs.writeFile('sfdx-auth/credentials.json', JSON.stringify(credentials), err => {
            console.log(err ? err : 'credentials created');
        })
    } else {
        console.log("scracth org not created or none available");
    }
    // await sfdx.force.org.delete({
    //     _quiet: false,
    //     targetusername: targetScratchOrg.username,
    //     noprompt: true
    // }); 
    console.log(await sfdx.force.org.list());
}

prepareOrg();







