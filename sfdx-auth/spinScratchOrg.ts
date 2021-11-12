import { Client } from 'sfdx-js';
import { ScratchPreparator } from './tools/ScratchPreparator';

(async () => {
    console.log('preparing scratch org for testing:');
    const scratchOrg = new ScratchPreparator('sfdx', { url: process.argv[2] }, 'salesforce-test-org', 'develop');
    try {
        await scratchOrg.Ready.then(async (org) => {
            await org.push();
            await org.credentialsFile(await org.fetchCredentials());
        })
    } catch (errors) {
        console.error(`unable to prepare scratch org for testing due to:\n${errors}`);
        process.exit(1);
    }
})();

