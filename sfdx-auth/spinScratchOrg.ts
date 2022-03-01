import { Client } from 'sfdx-js';
<<<<<<< HEAD
import { ScratchPreparator } from './tools/ScratchPreparator';
const sfdx = Client.createUsingPath('sfdx');

(async () => {
    console.log('preparing scratch org for testing:');
    const scratchOrg = new ScratchPreparator('sfdx', {url: process.argv[2]}, 'salesforce-test-org');
    try {
        await scratchOrg.Ready.then( async (org) => {
            await org.push();
            await org.generatePassword();
=======
import { API_CREDENTIALS } from '../support/API/SFAPI';
import { ScratchPreparator } from './tools/ScratchPreparator';


(async () => {
    console.log('preparing scratch org for testing:');
    const apiCredentials: API_CREDENTIALS = {
        username: process.argv[3],
        password: process.argv[4]
    }
    const scratchOrg = new ScratchPreparator('sfdx', { url: process.argv[2] }, 'salesforce-test-org', 'develop', apiCredentials);
    try {
        await scratchOrg.Ready.then(async (org) => {
            await org.push();
>>>>>>> master
            await org.credentialsFile(await org.fetchCredentials());
        })
    } catch (errors) {
        console.error(`unable to prepare scratch org for testing due to:\n${errors}`);
        process.exit(1);
    }
})();

