import { API_CREDENTIALS } from '../../support/API/SFDC_API';
import { ScratchPreparator } from '../tools/ScratchPreparator';


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
            await org.credentialsFile(await org.fetchCredentials());
        })
    } catch (errors) {
        console.error(`unable to prepare scratch org for testing due to:\n${errors}`);
        process.exit(1);
    }
})();

