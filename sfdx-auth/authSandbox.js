const fs = require('fs');
const sfdx = require('sfdx-node');

async function readAuth() {
    console.log('fething auth token');
    return new Promise((tokenFetched, failure) => {
        fs.writeFile('./sfdx-auth/auth.json', process.argv[2], error => {
            if (error) {
                failure(`unable to save auth.josn due to:\n${error.message}`);
            } else {
                tokenFetched('auth.json saved');
            }
        });
    });
}

async function authorizeSFDX() {
    console.log('authorizing org');
    const auth = await sfdx.auth.sfdxurl.store({
        _quiet: false,
        sfdxurlfile: './sfdx-auth/auth.json',
        setdefaultdevhubusername: true,
        setdefaultusername: true
    });
    return new Promise((sfdxAuthorized, failure) => {
        if (auth) { sfdxAuthorized(`authorized org for username: ${auth.username}`) }
        else { failure('unable to authorize') }
    })
}

async function saveCredentials() {
    const orgList = await sfdx.force.org.list({
        _quiet: false,
        noprompt: true,
        all: true,
        clean: true,
        json: true
    });

    const targetOrg = orgList.nonScratchOrgs[0];
    const credentials = {
        loginUrl: targetOrg.loginUrl,
        username: targetOrg.username,
        password: process.argv[3],
        baseUrl: targetOrg.instanceUrl
    }
    return new Promise((credentialsSaved, failure) => {
        fs.writeFile('./sfdx-auth/credentials.json', JSON.stringify(credentials), error => {
            if (error) {
                failure(`unable to save credentials due to:\n${error}`);
            } else {
                credentialsSaved('credentials.json saved');
            }
        })
    })
}

(async () => {
    try{
        console.log(await readAuth());
        console.log(await authorizeSFDX());
        console.log(await saveCredentials());
    } catch (error) {
        console.error(`unable to create credentials due to:\n${error}`); 
        process.exit(1);
    }
})();





