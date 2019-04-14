import {transform} from 'babel-core'
import ContractCodeReflection from '../../babel/babel-plugin-contract-code-reflection'

/**
 * The class implements the work with the js code
 */
export default class Contract {

    constructor(options) {
        if (!options) {
            throw new TypeError('"options" is expected')
        }
        if (!options.hasOwnProperty('contractName') || !options.contractName) {
            throw new TypeError('"contractName" is expected')
        }
        if (!options.hasOwnProperty('contractAddress') || !options.contractAddress) {
            throw new TypeError('"contractAddress" is expected')
        }
        if (!options.hasOwnProperty('feePrice')) {
            throw new TypeError('"feePrice" is expected')
        }

        this.code = options.contractCode
        this.feePrice = options.feePrice
        this.metadata = options.metadata

    }

    getMetadata() {
        return this.metadata
    }

    /**
     * calculates sufficient fee to call the constructor
     * @param options
     */
    getConstructorFee(options) {
        const loops = options.loops || 1
        return {}
    }

    /**
     * calculates sufficient fee to call the specified method
     * @param options
     */
    getMethodFee(options) {

    }
}
