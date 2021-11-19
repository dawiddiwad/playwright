import { SandboxPreparator } from "./tools/SandboxPreparator";

const token = process.argv[2];
const sandbox = new SandboxPreparator('sfdx', { url: token }, 'salesforce-test-org', 'develop');
(async () => {
    try {
        console.log('preparing sandbox for testing:');
        await sandbox.Ready.then(async (org) => {
            await org.credentialsFile(await org.fetchCredentials());
        })
    } catch (error) {
        console.error(`unable to prepare sandbox due to:\n${error}`);
        process.exit(1);
    }
})()