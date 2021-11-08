import { writeFile } from 'fs/promises';
import { Client } from 'sfdx-js';
import { exec } from 'child_process';
const sfdx = Client.createUsingPath('sfdx');

const branch                =   'develop';
const repo                  =   'salesforce-test-org';
const sfdcModuleRepoLink    =   `"https://github.com/dawiddiwad/${repo}.git"`;
let maxTries                =   2;

async function cloneComponentRepo() {
    return new Promise<string>((repoCloned, failure) => {
        console.log('[step 1/5] cloning component repo...')
        const gitClone = exec(`git clone --branch ${branch} ${sfdcModuleRepoLink}`);
        gitClone.on('exit', (code) => 
            code !== 1 ? repoCloned('repo cloned sucesfully') : 'was not able to clone repo');
        gitClone.on('error', (error) => 
            failure(`unable to clone because of:\n${error}`));
    })
}

async function readAuth() {
    console.log('[step 2/5] fetching auth token...');
    await writeFile('./sfdx-auth/auth.json',`{"sfdxAuthUrl": "${process.argv[2]}"}`);
}

async function authorize() {
    await readAuth();
    console.log('[step 3/5] authorizing org...');
    await sfdx.auth.sfdxurlStore({
        sfdxurlfile:                './sfdx-auth/auth.json',
        setdefaultdevhubusername:   true,
        setdefaultusername:         true
    });
}

async function prepareScratchOrg(): Promise<any> {
    if(maxTries-->0){
        console.log('[step 4/5] preparing scratch org...');
        const orgList: any = await sfdx.org.list({
            noprompt:   true,
            all:        true,
            clean:      true,
            json:       true
        });
    
        const devHub = orgList.result.nonScratchOrgs[0];
        let scratchOrg = null;
    
        if (orgList.result.scratchOrgs.length === 0){
            await spinNewScratchOrg(devHub.username);
            return prepareScratchOrg();
        } else{
            scratchOrg = orgList.result.scratchOrgs[0];
        }
    
        if (!scratchOrg.password){
            scratchOrg.password = (await setScratchOrgPassword(devHub.username, scratchOrg.username)).result.password;
        }
    
        console.log('\tpushing sources...');
        process.chdir('./salesforce-test-org');
        await sfdx.source.push({
            forceoverwrite: true,
            targetusername: scratchOrg.username
        })
        process.chdir('../');
    
        prepareCredentials({
            loginUrl:   scratchOrg.loginUrl,
            username:   scratchOrg.username,
            password:   scratchOrg.password,
            baseUrl:    scratchOrg.instanceUrl
        });
    } else {
        throw new Error('scratchOrgs retries limit is up');
    }
}

async function prepareCredentials(orgData: any) {
    console.log('[step 5/5] writing credentials file...');
    await writeFile('./sfdx-auth/credentials.json', JSON.stringify(orgData));
}

async function spinNewScratchOrg(devHubUsername: string): Promise<void|any> {
    console.log('\tcreating new scratch org...');
    return await sfdx.org.create({
        json: true,
        definitionfile:         './salesforce-test-org/config/project-scratch-def.json',
        targetdevhubusername:   devHubUsername,
        durationdays:           1
    }).catch((e)=> {console.log('\tsomething went wrong - trying to continue anyway...')})
}

async function setScratchOrgPassword(devHubUsername: string, scratchOrgUsername: string): Promise<void|any>{
    console.log('\tsetting password...');
    return await sfdx.user.passwordGenerate({
        targetdevhubusername:   devHubUsername,
        targetusername:         scratchOrgUsername
    })
}

(async () => {
    console.log('preparing scratch org for testing in 6 steps:');
    try {
        await cloneComponentRepo();
        await authorize();
        await prepareScratchOrg();
    } catch (errors) {
        console.error(`unable to prepare scratch org for testing due to:\n${errors}`);
        process.exit(1);
    }
})();

