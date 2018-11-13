import fs from 'fs'
import {transformFileSync} from 'babel-core'

import GiantPath from '../path'
import ContractValidator from '../babel/babel-plugin-contract-validator'
import ContractFee from "../babel/babel-plugin-contract-fee";

export default class GiantContract {

    constructor (name) {
        this.name = name
        this.fileName = GiantPath.getContractFile(name)
        this.targetFileName = GiantPath.getTargetContractFile(name)
    }

    compile () {
        // TODO need to transform & compress code for production ready network
        // build & validate contract
        const {ast, code} = transformFileSync(this.fileName, {
            'plugins': [ContractFee]
        })

        // TODO need to optimize ast before saving
        fs.writeFileSync(this.targetFileName, code)

        this.ast = ast
        this.code = code
    }

    getCode () {
        return this.code
    }
}
