import Database from './Database'
import Wallet from './Wallet'
import Chain from './Chain'
import Contract from './Contract'
import Transaction from './Transaction'

import EventEmitter from 'events'
import TransactionType from "./TransactionType";
import logger from "../../logger";
import giantConfig from "../../config";

/**
 * The Giant mock network, used to compile, test, and debug smart contracts in a development environment
 */
export default class MockClient extends EventEmitter {

    constructor(options) {
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

    getAccounts() {
        return this.wallet.getAccounts()
    }

    getBalance() {
        return this.wallet.getBalance()
    }

    getDB() {
        return this.db
    }

    sendFrom(from, to, amount) {
        logger.warn(`MockClient call tx transfer. Debug ${giantConfig.debug}`)
        return new Promise((resolve, reject) => {

        })
    }

    deployContract(options) {
        const self = this

        return new Promise((resolve, reject) => {
            try {
                options.feePrice = options.metadata.deployFee || 1000

                const transaction = Transaction.deployContract(options)
                transaction.inputs = options.inputs || []
                transaction.outputs = options.outputs || []

                this.db.memPool.addTransaction(transaction)
                    .then(() => {
                        logger.warn(`Add transaction to memPool. Success. Debug ${giantConfig.debug}`)
                        if(giantConfig.debug){
                            console.log(this.db.memPool.getTransactions())
                        }
                    })
                    .catch(function (error) {
                        console.log(error)
                        reject()
                    })

            } catch (err) {

                console.log(err);

            }
        })
    }

   /*callContract(from, contractAddress, method, args) {
        return new Promise((resolve, reject) => {


        })
    }*/

    stop() {
        this.chain.stop()
    }
}
