import fs from 'fs'
import {transformFileSync, transform} from 'babel-core'
import UglifyJS from 'uglify-js'
import GiantPath from '../path'
import ContractValidator from '../babel/babel-plugin-contract-validator'
import ContractFee from '../babel/babel-plugin-contract-fee'

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
            let data = fs.readFileSync(this.fileName, 'utf8')

            fs.writeFileSync(this.targetFileName, data)

            let {code} = transformFileSync(this.fileName)

            let result = transform(code, {
                'plugins': [ContractFee]
            })
            let pfeDesc = '\nfunction pfe(pfeVars){console.log(pfeVars)}'

            let runTimeCode = UglifyJS.minify(result.code + pfeDesc)

            // TODO need to optimize ast before saving
            fs.writeFileSync(this.targetFileNameRunTime, runTimeCode.code)

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
