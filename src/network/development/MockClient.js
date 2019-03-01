import Database from './Database'
import Wallet from './Wallet'
import Chain from './Chain'
import Contract from './Contract'
import Transaction from './Transaction'

import EventEmitter from 'events'
import TransactionType from "./TransactionType";
import logger from "../../logger";
import giantConfig from "../../config";
import Hash from "./Hash";

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

                let transaction = Transaction.deployContract(options)

                logger.warn(`Transaction  ${transaction.id} prevBlockHash ${transaction.prevBlockHash}`)

                this.db.memPool.addTransaction(transaction)
                    .then((inputsOutputs) => {
                        logger.warn(`Add transaction to memPool. Success. Debug ${giantConfig.debug}`)

                        if (giantConfig.debug) {
                            logger.warn(`Transaction in memPool.`)
                            console.log(this.db.memPool.getTransactions())
                        }

                        //https://bitcoin.org/en/glossary/signature-script
                        //scriptSig = <sig> <pubKey>
                        //scriptPubKey = OP_DUP OP_HASH160 <pubKeyHash> OP_EQUALVERIFY OP_CHECKSIG

                        let inputs = inputsOutputs[0][0]

                        let outputs = inputsOutputs[1][1]

                        for (let i in this.wallet.accounts) {
                            if (this.wallet.accounts[i].publicKey == inputs.scriptSig) {
                                if (this.wallet.accounts[i].premine > outputs.value) {
                                    this.wallet.accounts[i].premine = this.wallet.accounts[i].premine - outputs.value

                                    logger.info(`Caller ${this.wallet.accounts[i].publicKey} spent ${outputs.value} GIC`)
                                } else {
                                    logger.error(`Caller ${this.wallet.accounts[i].publicKey} can't spent ${outputs.value}, 
                                    case have only ${this.wallet.accounts[i].premine} GIC`)
                                }
                            }

                            if (this.wallet.accounts[i].publicKey == outputs.to) {
                                this.wallet.accounts[i].premine = this.wallet.accounts[i].premine + outputs.value
                            }
                        }
                        this.db.updateWallets(this.wallet.accounts, (response) => {
                            logger.info(response)

                            resolve(this.wallet.accounts)
                        })
                    })
                    .catch(function (error) {
                        console.log(error)

                        reject()
                    })
            } catch (err) {
                console.log(err)
            }
        })
    }

    callContract(options) {
        const self = this

        let wallets = this.db.getWallets()
            .then((wallets) => {
                for (let i in wallets) {
                    console.log(wallets[i].publicKey)
                    if (wallets[i].publicKey == giantConfig.caller.publicKey) {
                        options.inputValue = wallets[i].premine
                        console.log(wallets[i].premine)
                    }
                }

                this.db.getMetadata()
                    .then((metadata) => {
                        /**
                         * TODO : find contract in metadata.contracts array
                         */
                        const methods = metadata.contracts[0][options.contractAddress].methods

                        options.methodFee = 0

                        for (let i in methods) {
                            if (options.method == methods[i].name) {
                                options.feePrice = methods[i].params[0].fee
                            }
                        }

                        if (!options.feePrice) {
                            logger.error(`Can't find method fee`)
                            return
                        }

                        return new Promise((resolve, reject) => {
                            try {
                                let transaction = Transaction.callContract(options)
                                console.log('----------..transaction..-----------')
                                console.log(transaction)
                                console.log('----------..transaction..-----------')
                                resolve()

                            } catch (err) {
                                console.log(err)
                            }
                        })
                    })
            })
    }

    stop() {
        this.chain.stop()
    }
}
