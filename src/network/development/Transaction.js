import giantConfig from '../../config'
import Hash from './Hash'
import TransactionType from './TransactionType'
import Contract from './Contract'
import logger from "../../logger";

export default class Transaction {

    constructor(options) {
        this.options = options
        //giantConfig.debug = true
        logger.warn(`Transaction constructor(options) debug ${giantConfig.debug}`)
        if (giantConfig.debug) {
            console.log(options)
        }
        this.type = options.type || TransactionType.TRANSFER

        //TODO count
        this.feePrice = options.feePrice || giantConfig.feePrice

        if (typeof options.contractName != 'undefined') {
            let contract = new Contract(options)
            this.data = [contract]
        }

        this.inputs = options.inputs || []
        this.outputs = options.outputs || []

        const hashProperty = {
            configurable: false,
            writeable: false,
            get: () => this.getHash(),
            set: () => {
            }
        }

        Object.defineProperty(this, 'hash', hashProperty)
        Object.defineProperty(this, 'id', hashProperty)
    }

    static generation() {
        return new Transaction({
            type: TransactionType.GENERATION,
            inputs: [{
                coinbase: '000000000000000000000000000000000000000000000000',
                sequence: 0
            }]
        })
    }

    static sendFrom() {
        return new Transaction({type: TransactionType.TRANSFER})
    }

    static deployContract(options) {
        options.type = TransactionType.CONTRACT_DEPLOY
        return new Transaction(options)
    }

    static callContract() {
        return new Transaction({type: TransactionType.CONTRACT_CALL})
    }

    toObject() {
        const json = {
            type: this.type,
            data: this.data,
            inputs: this.inputs,
            outputs: this.outputs
        }

        if (this.type === TransactionType.CONTRACT_DEPLOY || this.type === TransactionType.CONTRACT_CALL) {
            json.feePrice = this.feePrice
        }
        return json
    }

    toJson() {
        return JSON.stringify(this.toObject())
    }

    getHash() {
        return Hash.sha256(this.toJson())
    }

    validate() {

        // TODO : validate
        return new Promise((resolve, reject) => {
            if (this.type === 'deploy') {
                const contract = new Contract(this.options)
                resolve(contract)
            } else if (this.type === 'call') {
                // TODO call contract method
                const result = null // Result of contract's method execution
                resolve(result)
            } else if (this.type === 'transfer') {
                /*sendCoin (receiver) {
                    const tx = getTransaction()
                    const sender = getCallerAddress()
                    const senderBalance = this.balances.get(sender)
                    if (senderBalance < tx.amount) {
                        return false
                    }

                    const receiverBalance = this.balances.get(receiver)
                    this.balances.set(sender, senderBalance - tx.amount)
                    this.balances.set(receiver, (receiverBalance ? receiverBalance : 0) + tx.amount)

                    return true
                }*/
                resolve(null)
            } else {
                resolve(null)
            }
        })
    }
}
