import Block from './Block'
import Database from './Database'
import Wallet from './Wallet'
import Chain from './Chain'
import Transaction from './Transaction'

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

        self.db.on('ready', () => {
            self.chain.initialize()
        })

        self.db.on('error', (err) => {
            self.emit('error', err)
        })

        self.chain.on('ready', () => {
            self.emit('ready')
        })

        self.chain.on('error', (err) => {
            self.emit('error', err)
        })
    }

    getAccounts () {
        return this.wallet.getAccounts()
    }

    getBalance () {

    }

    sendFrom (from, to, amount) {
        return new Promise((resolve, reject) => {

        })
    }

    deployContract (from, code) {
        return this.db.memPool.addTransaction(Transaction.deployContract(from, code))
    }

    callContract (from, contractAddress, method, args) {
        return new Promise((resolve, reject) => {

        })
    }

    connect () {
        return new Promise((resolve, reject) => {
            setInterval(() => {
                if (this.mempool.length) {

                    // TODO should be limited to the maximum block size
                    const newTxs = mempool.slice(0)

                    const nextBlock = new Block(this.currentBlock, newTxs, {
                        version: 1
                    })


                } else {
                    console.log('mempool is empty')
                }
            }, this.blockTime)
        })
    }
}