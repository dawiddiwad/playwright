import {exec} from 'child_process';

interface SdfxParameters {
    cmd: string,
    params: Array<string>,
    log?: boolean
}

export class SFDX {
    private path: string;

    constructor (path: string){
        this.path = path;
    }

    private pass(paramsList: Array<string>): string {
        let params: string = '';
        paramsList.forEach((param) => {
            params += `${param} `;
        })
        return params;
    }

    public exec({cmd, params, log}: SdfxParameters): Promise<string> {
        return new Promise<string>((sfdxResponse, sfdxFailure) => {
            exec(`${this.path} ${cmd} ${this.pass(params)}`, (error, stdout, stderr) => {
                if (error) {
                    sfdxFailure(`sfdx execution failed on:\n${error} ${stderr}`);
                } else {
                    log ? console.log(`sfdx response:\n${stdout}`) : null;
                    sfdxResponse(stdout)
                }
            })
        })
    }
}

