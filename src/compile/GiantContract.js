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
        this.code = {}
        this.code.es5 = false
        this.code.es6 = false
        this.code.es5pfe = false
        this.code.runTime = false
        this.fileName = GiantPath.getContractFile(name)
        this.targetFileName = GiantPath.getTargetContractFile(name)
        this.targetFileNameRunTime = GiantPath.getTargetContractFileRunTime(name)
    }

    compile() {
        if (this.valid) {
            let that = this

            /**
             * TODO : pfeDesc - fn for init payment proccess
             */

            let pfeDesc = '\nfunction pfe(pfeVars){console.log(pfeVars)}'

            /**
             * this.code.es6 - the original, readable contract code
             */

            this.code.es6 = fs.readFileSync(this.fileName, 'utf8')

            fs.writeFileSync(this.targetFileName, this.code.es6)

            let {code} = transformFileSync(this.fileName)

            /**
             * this.code.es5 - the es5 transpiled code
             */

            this.code.es5 = code

            let result = transform(this.code.es5, {
                'plugins': [ContractFee]
            })

            /**
             * this.code.es5pfe - the es5 contract code and pfe
             */

            this.code.es5pfe = result.code + pfeDesc

            /**
             * this.code.runTime - final, runtime version
             */

            this.code.runTime = UglifyJS.minify(this.code.es5pfe)

            fs.writeFileSync(this.targetFileNameRunTime, this.code.runTime)

            this.compiled = true

            figlet('runtime', function (err, data) {
                if (err) {
                    logger.error('Something went wrong...');
                    console.dir(err);
                    return;
                }
                console.log(data)
                logger.warn(`Succeseful! Contract ${that.name} was compiled ${GiantPath.getTargetContractFileRunTime(that.name)}`)
            })
            console.log(this.getCode())
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
                logger.error('Something went wrong...');
                console.dir(err);
                return;
            }
            console.log(data)
            logger.warn(`Contract ${that.name} is valid ${GiantPath.getTargetContractFile(that.name)}`)
        })
    }

    getCode() {
        if (this.code.runTime) {
            return this.code.runTime
        } else {
            logger.warn(`Contract code ${this.name} not compiled.`)
        }
    }

    getEs6Code() {
        if (this.code.es6) {
            return this.code.es6
        } else {
            logger.warn(`Contract code ${this.name} not compiled.`)
        }
    }

    test() {

    }
}
