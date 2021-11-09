import { exec } from 'child_process';

interface SdfxParameters {
    cmd: string,
    f?: Array<string>,
    log?: boolean
}
export class SFDX {
    private path: string;

    constructor(sfdxEnvPathVariable: string) {
        this.path = sfdxEnvPathVariable;
    }

    private pass(paramsList: Array<string>): string {
        let params: string = '';
        paramsList.forEach((param) => {
            params += `${param} `;
        });
        return params;
    }

    private parseResponse(response: string): string | Object {
        try {
            return JSON.parse(response).result;
        }
        catch {
            return response;
        }
    }

    public exec({ cmd, f: flags, log }: SdfxParameters): Promise<string | Object> {
        console.log(`executing SFDX command: ${cmd} ${flags || null}`);
        return new Promise<string | Object>((sfdxResponse, sfdxFailure) => {
            exec(`${this.path} ${cmd} ${flags ? this.pass(flags) : null}`, (error, stdout, stderr) => {
                if (error) {
                    sfdxFailure(`SFDX command failed with exit code: ${error.code} caused by:\n${error}`);
                } else if (stderr) {
                    sfdxFailure(`SFDX command failed on:\n${stderr}`);
                }
                else {
                    log ? console.log(`SFDX command response:\n${stdout}`) : null;
                    sfdxResponse(this.parseResponse(stdout));
                }
            });
        });
    }
}