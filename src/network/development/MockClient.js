import Database from './Database'
import Wallet from './Wallet'
import Chain from './Chain'
import Contract from './Contract'

import EventEmitter from 'events'

/**
 * The Giant mock network, used to compile, test, and debug smart contracts in a development environment
 */
export default class MockClient extends EventEmitter {

    constructor (options) {
        super()

        if (!options) {
            options = {}
        }
        options.client = this

        this.db = options.db = new Database(options)
        this.wallet = options.wallet = new Wallet(options)
        this.chain = options.chain = new Chain(options)

        const self = this

        setImmediate(() => {
            self.db.initialize()
        })

        this.db.on('ready', () => {
            self.chain.initialize()
        })

        this.db.on('error', (err) => {
            self.emit('error', err)
        })

        this.chain.on('ready', () => {
            self.wallet.initialize()
        })

        this.chain.on('error', (err) => {
            self.emit('error', err)
        })

        this.wallet.on('ready', () => {
            self.emit('ready')
        })

        this.wallet.on('error', (err) => {
            self.emit('error', err)
        })
    }

    getAccounts () {
        return this.wallet.getAccounts()
    }

    getBalance () {
        return this.wallet.getBalance()
    }

    sendFrom (from, to, amount) {
        return new Promise((resolve, reject) => {

        })
    }

    deployContract (from, code, options) {
        const self = this
        return new Promise((resolve, reject) => {
            const contract = new Contract({
                code: code,
                feePrice: options.feePrice || 0.0000001
            })
            const fee = contract.getConstructorFee({
                loops: 10
            })

            const transaction = Transaction.deployContract()
            transaction.inputs = options.inputs || []
            transaction.outputs = options.outputs || []
            transaction.feePrice = contract.feePrice

            this.db.memPool.addTransaction(transaction)
                .then((tx) => {
                    contract.name = 'MetaCoin'
                    contract.address = '0x1G9033a3HdF74E1d7619347bC491d73A36967d72'
                    contract.fee = 10.0
                    contract.methods = {
                        buyCoin: [],
                        sendCoin: ['receiver'],
                        getBalance: ['address']
                    }

                    resolve(contract)
                })
                .catch(reject)
        })
    }

    callContract (from, contractAddress, method, args) {
        return new Promise((resolve, reject) => {

        })
    }

    stop () {
        this.chain.stop()
    }
}
