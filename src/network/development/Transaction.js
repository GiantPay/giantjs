import Hash from './Hash'
import TransactionType from './TransactionType'
import Contract from './Contract'

export default class Transaction {

    constructor (options) {
        if (!options) {
            options = {}
        }

        this.type = options.type || TransactionType.TRANSFER
        this.data = options.data
        this.feePrice = options.feePrice
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

    static generation () {
        return new Transaction({
            type: Type.GENERATION,
            inputs: [{
                coinbase: '000000000000000000000000000000000000000000000000',
                sequence: 0
            }]
        })
    }

    static sendFrom () {
        return new Transaction({type: TransactionType.TRANSFER})
    }

    static deployContract () {
        return new Transaction({type: TransactionType.CONTRACT_DEPLOY})
    }

    static callContract () {
        return new Transaction({type: TransactionType.CONTRACT_CALL})
    }

    toObject () {
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

    toJson () {
        return JSON.stringify(this.toObject())
    }

    getHash () {
        return Hash.sha256(this.toJson())
    }

    validate () {
        return new Promise((resolve, reject) => {
            if (this.type === 'deploy') {
                // TODO deploy contract
                const contract = new Contract() // Deployed contract object
                contract.name = 'MetaCoin'
                contract.address = '0x1G9033a3HdF74E1d7619347bC491d73A36967d72'
                contract.fee = 10.0
                contract.methods = {
                    buyCoin: [],
                    sendCoin: ['receiver'],
                    getBalance: ['address']
                }
                resolve(contract)
            } else if (this.type === 'call') {
                // TODO call contract method
                const result = null // Result of contract's method execution
                resolve(result)
            } else {
                resolve(null)
            }
        })
    }
}
