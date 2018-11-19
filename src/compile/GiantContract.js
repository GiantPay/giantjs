import fs from 'fs'
import {transformFileSync} from 'babel-core'

import GiantPath from '../path'
import ContractValidator from '../babel/babel-plugin-contract-validator'
import ContractFee from "../babel/babel-plugin-contract-fee";

export default class GiantContract {

    constructor(name) {
        this.valid = false
        this.compiled = false
        this.name = name
        this.fileName = GiantPath.getContractFile(name)
        this.targetFileName = GiantPath.getTargetContractFile(name)
        this.targetFileNameRunTime = GiantPath.getTargetContractFileRunTime(name)
    }

    compile() {
        if (this.valid) {
            let data = fs.readFileSync(this.fileName, 'utf8');

            fs.writeFileSync(this.targetFileName, data)

            const {ast, code} = transformFileSync(this.fileName, {
                'plugins': [ContractFee]
            })

            // TODO need to optimize ast before saving

            let pfeDesc = `\nfunction pfe(declaration, fee){
                console.log(declaration, fee)
            }`

            fs.writeFileSync(this.targetFileNameRunTime, code + pfeDesc)

            this.ast = ast
            this.code = code
            this.compiled = true
        }
    }

    validate() {
        transformFileSync(this.fileName, {
            'plugins': [ContractValidator]
        })

        this.valid = true
    }

    getCode() {
        return this.code
    }
}
