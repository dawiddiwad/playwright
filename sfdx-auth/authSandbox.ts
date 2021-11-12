import { SandboxPreparator, SANDBOX_CREDENTIALS } from "./tools/SandboxPreparator";

const token = process.argv[2];
const password = process.argv[3];
const sandbox = new SandboxPreparator('sfdx', { url: token }, 'salesforce-test-org', 'develop');
(async () => {
    try {
        await sandbox.Ready.then(async (org) => {
            let data: SANDBOX_CREDENTIALS = await org.fetchCredentials();
            data.password = password;
            await org.credentialsFile(data);
        })
    } catch (error) {
        console.error(`unable to prepare sandbox due to:\n${error}`);
        process.exit(1);
    }
})()