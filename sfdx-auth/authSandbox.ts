import { writeFile } from 'fs/promises';
import { Client } from 'sfdx-js';
const sfdx = Client.createUsingPath('sfdx');

async function readAuth() {
    console.log('[step 1/5] fetching auth token...');
    await writeFile('./sfdx-auth/auth.json', process.argv[2]);
}

async function authorize() {
    console.log('[step 2/5] authorizing org...');
    await sfdx.auth.sfdxurlStore({
        sfdxurlfile: './sfdx-auth/auth.json',
        setdefaultdevhubusername: true,
        setdefaultusername: true
    });
}

async function generateCredentials() {
    console.log('[step 3/5] fetching sanboxes...');
    const orgList: any = await sfdx.org.list({
        noprompt: true,
        all: true,
        clean: true,
        json: true
    });

    console.log('[step 4/5] fetching credentials data...');
    const targetOrg = orgList.result.nonScratchOrgs[0];
    const credentials = {
        loginUrl: targetOrg.loginUrl,
        username: targetOrg.username,
        password: process.argv[3],
        baseUrl: targetOrg.instanceUrl
    }

    console.log('[step 5/5] writing credentials file...');
    await writeFile('./sfdx-auth/credentials.json', JSON.stringify(credentials));
}

(async () => {
    console.log('generating sandbox credentials in 5 steps:')
    try{
        //await readAuth();
        await authorize();
        await generateCredentials();
    } catch (errors) {
        console.error(`unable to generate sandbox credentials due to:\n${errors}`); 
        process.exit(1);
    }
})();






