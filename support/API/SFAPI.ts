import { Connection, ErrorResult, QueryResult, Record, RecordResult, RecordStream, SalesforceId, SObject, SuccessResult, UserInfo } from "jsforce";

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
            } catch(error) {
                console.error(`unable to initialize SFDC API due to:\n${error}`);
                failure(error);
            }
        })
    }

    private checkForErrors(results: RecordResult[]): SuccessResult[] {
        let errors: string[] = [];
        results.forEach((result) => {
            if (!result.success){
                (result as ErrorResult).errors
                    .forEach((error) => errors.push(error));
            }
        })
        if (errors.length > 0) {
            throw new Error(`some issues on creating ${JSON.stringify(errors)}`);
        } else return results as SuccessResult[];
    }

    public async create(sobject: string, data: Object | Array<Object>): Promise<SuccessResult | SuccessResult[]> {
        try {
            console.log(`creating new ${sobject} ...`);
            const results = await this.conn.create(sobject, data, {allOrNone: true});
            if (results instanceof Array){
                return this.checkForErrors(results);
            } else {
                return results as SuccessResult;
            }
        } catch (error) {
            console.error(`unable to create ${sobject} due to:\n${(error as Error).stack}`);
            process.exit(1);
        }
    }

    public async delete(sobject: string, id: SalesforceId | string[]): Promise<RecordResult | RecordResult[]>{
        try {
            console.log(`deleting ${sobject} records ${id} ...`);
            const result = await this.conn.delete(sobject, id);
            console.log(`deleted ${sobject} :\n${JSON.stringify(result)}`);
            return result;
        } catch (error) {
            console.error(`unable to delete ${sobject} due to:\n${error}`);
            process.exit(1);
        }
    }

    public async read(sobject: string, id: SalesforceId | string[]): Promise<Record | Record[]>{
        try {
            console.log(`reading ${sobject} data of ${id} ...`);
            const result = await this.conn.retrieve(sobject, id);
            console.log(result);
        } catch (error) {
            
        }
    }

    public async query(soql: string): Promise<QueryResult<unknown>>{
        try {
            return await this.conn.query(soql);
        } catch (error) {
            console.error(`unable to execute soql:\n${soql}\ndue to:\n${error}`);
            process.exit(1);
        }
    }
}

(async ()=> {
    new SFDCapi({username: 'dawid89dobrowolski@brave-wolf-qm0gmg.com', password: '%Zaamdkjop9rn'})
        .Ready.then(async (api) => {
            const acc = await api.create('Account', [{name: 'api2'}, {yolo: 'api2'}]);
            console.log(acc);
            console.log((await api.query('select id from Account')).totalSize);
        })
})()
