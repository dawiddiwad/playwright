import { API_CREDENTIALS } from "../support/API/SFAPI";
import { SandboxPreparator } from "./tools/SandboxPreparator";

const token = process.argv[2];
const apiCredentials: API_CREDENTIALS = {
    username: process.argv[3],
    password: process.argv[4]
}
const sandbox = new SandboxPreparator('sfdx', { url: token }, 'salesforce-test-org', 'develop', apiCredentials);
(async () => {
    try {
        console.log('preparing sandbox for testing:');
        console.log(token);
        await sandbox.Ready.then(async (org) => {
            await org.credentialsFile(await org.fetchCredentials());
        })
    } catch (error) {
        console.error(`unable to prepare sandbox due to:\n${error}`);
        process.exit(1);
    }
})()