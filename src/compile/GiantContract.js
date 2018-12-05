import fs from 'fs'
import {transformFileSync, transform} from 'babel-core'
import UglifyJS from 'uglify-js'
import GiantPath from '../path'
import ContractValidator from '../babel/babel-plugin-contract-validator'
import ContractFee from '../babel/babel-plugin-contract-fee'
import figlet from 'figlet'
import logger from '../logger'

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
            let that = this
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
            figlet('transpiled es5', function (err, data) {
                if (err) {
                    console.log('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.log(data)
                logger.warn(`Succeseful! Contract ${that.name} was compiled in file ./build/contracts/${that.name}RunTime.js`)
            })


        }
    }

    validate() {
        let that = this

        transformFileSync(this.fileName, {
            'plugins': [ContractValidator]
        })

        this.valid = true

        figlet('valid es6', function (err, data) {
            if (err) {
                console.log('Something went wrong...');
                console.dir(err);
                return;
            }
            console.log(data)
            logger.warn(`Contract ${that.name} is valid.`)
        })
    }

    getCode() {
        return this.code
    }
}
