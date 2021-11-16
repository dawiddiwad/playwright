import { Connection, QueryResult, RecordResult, UserInfo } from "jsforce";

interface SFDC_CREDENTIALS {
    username: string,
    password: string
}

export class SFDCapi {
    private conn: Connection;
    public Ready: Promise<SFDCapi>;
    public userInfo!: UserInfo;

    constructor(credentials: SFDC_CREDENTIALS){
        this.conn = new Connection({});
        this.Ready = new Promise<SFDCapi>(async (connected, failure) => {
            try {
                this.userInfo = await this.conn.login(credentials.username, credentials.password);
                connected(this);
            } catch(e) {
                console.error(`unable to initialize SFDC API due to:\n${e}`);
                failure(e);
            }
        })
    }

    public async create(sobject: string, data: Object | Array<Object>): Promise<RecordResult | RecordResult[]> {
        try {
            console.log(`creating new ${sobject} ...`);
            const result: RecordResult | RecordResult[] = await this.conn.create(sobject, data);
            console.log(`created ${sobject} :\n${JSON.stringify(result)}`);
            return result;
        } catch (e) {
            console.error(`unable to create ${sobject} due to:\n${e}`);
            process.exit(1);
        }
    }

    public async query(soql: string): Promise<QueryResult<unknown>>{
        try {
            return await this.conn.query(soql);
        } catch (e) {
            console.error(`unable to execute soql:\n${soql}\ndue to:\n${e}`);
            process.exit(1);
        }
    }
}

(async ()=> {
    new SFDCapi({username: 'dawid89dobrowolski@brave-wolf-qm0gmg.com', password: '%Zaamdkjop9rn'})
        .Ready.then(async (api) => {
            await api.create('Account', {name: 'api'});
            console.log((await api.query('select id from Account')).totalSize);
        })
})()
