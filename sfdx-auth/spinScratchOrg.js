const fs = require('fs');
const sfdx = require('sfdx-node');
const { exec } = require('child_process');

const branch = 'develop';
const repo = 'salesforce-test-org';
const sfdcModuleRepoLink = `"https://github.com/dawiddiwad/${repo}.git"`;

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

async function spinOrg() {
    try {
        process.chdir('./salesforce-test-org');
        const auth = await sfdx.auth.sfdxurl.store({
            _quiet: false,
            sfdxurlfile: '../sfdx-auth/auth.json',
            setdefaultdevhubusername: true,
            setdefaultusername: true
        });

        const orgList = await sfdx.force.org.list();
        let targetScratchOrg = null;

        if (orgList.scratchOrgs.length !== 0) {
            targetScratchOrg = orgList.scratchOrgs[0];
            orgList.scratchOrgs.forEach(scratchOrg => {
                if (scratchOrg.alias === repo) {
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
        });

        if (targetScratchOrg) {
            await sfdx.force.source.push({
                _quiet: false,
                forceoverwrite: true,
                targetusername: targetScratchOrg.username
            });
            if (!targetScratchOrg.password) {
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
            throw new Error("scracth orgs not available");
        }
    } catch (error) {
        console.log(`unable to spinup scratch orgs due to:\n${error.message}`);
    }
}

prepareOrg();







