import { writeFile, readFile } from "fs/promises";
import { API_CREDENTIALS } from "../../support/API/SFDC_API";

interface SANDBOX {
    name: string,
    orgId: string,
    baseUrl: string,
    users: USER[]
}
interface USER {
    credentials: API_CREDENTIALS
}
export interface BASIC_CREDENTIALS {
    sandboxes: SANDBOX[]
}

export class UsernamePasswordFetcher {
    private credentials: API_CREDENTIALS;

    public static readonly CREDENTIALS_FILE_PATH: string = "./sfdx-auth/credentials-flow/credentials.json";

    constructor(credentials: API_CREDENTIALS){
        this.credentials = credentials;
    }

    public static async readFile(): Promise<BASIC_CREDENTIALS>{
        return <any> JSON.parse((await readFile(UsernamePasswordFetcher.CREDENTIALS_FILE_PATH)).toString());
    }

    public async writeToFile(): Promise<void>{
            try {
                let storedCreds: BASIC_CREDENTIALS = await UsernamePasswordFetcher.readFile();
                storedCreds.sandboxes.forEach((sandbox) => {
                    sandbox.users.forEach((user) => {
                        if (user.credentials.username === this.credentials.username){
                            user.credentials.password = this.credentials.password;
                        }
                    })
                })
                return await writeFile(UsernamePasswordFetcher.CREDENTIALS_FILE_PATH, JSON.stringify(storedCreds, null, 3));
            } catch(e){
                throw new Error(`unable to write basic credentials file due to\n${e}`)
            }
    }
}