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
        if (!options.hasOwnProperty('contract') || !options.contract || options.contract.length <= 2) {
            throw new TypeError('"contract" is expected')
        }
        if (!options.hasOwnProperty('feePrice')) {
            throw new TypeError('"feePrice" is expected')
        }

        this.code = options.contract.code.es6
        this.feePrice = options.feePrice

        const result = transform(this.code, {
            plugins: [
                [ContractCodeReflection]
            ],
            ast: true,
            comments: false,
            code: false
        })

        this.ast = result.ast
        this.className = result.ast.metadata.className
        this.methods = result.ast.metadata.methods
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
