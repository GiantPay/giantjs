import EventEmitter from 'events'
import Contract from "./Contract";
import logger from "../../logger";
import giantConfig from "../../config";

export default class MemPool extends EventEmitter {

    constructor(options) {
        super()
        this.db = options.db
        this.blocks = []
        this.transactions = []
    }

    addTransaction(transaction) {
        const self = this

        logger.warn(`MemPool addTransaction transaction ${transaction.id} type ${transaction.type}`)

        if (transaction.type == 'generation') {

            return new Promise((resolve, reject) => {
                logger.warn(`Transaction type : ${transaction.type}`)

                if (!self.hasTransaction(transaction.txId)) {
                    self.transactions.push(transaction)
                    self.emit('transaction', transaction)
                }

                resolve({'id': transaction.txId})
            })
        } else {
            return new Promise((resolve, reject) => {
                transaction.validate() //result like contract move to create method
                    .then((contract) => {
                        if (contract) {

                            contract.txid = contract.metadata.txid = transaction.getHash()

                            logger.warn(`Mempool contract.txid : ${contract.txid}`)

                            if (!self.hasTransaction(contract.txid)) {
                                self.transactions.push(transaction)
                                self.emit('transaction', transaction)
                            }

                            const wallets = [
                                {to: 'GUuf1RCuFmLAbyNFT5WifEpZTnLYk2rtVd', value: 20000},
                                {to: 'GPLkrYE3GdXDoZMz4zhxyBmTiF1N3AQvpH', value: 20010},
                                {to: 'Gf84TLVMVaEBD1Vb5ZSax39i8VorgB5nC3', value: 20020},
                                {to: 'GKFej3xYYzbv8qD5p2Q6CGxQVz1uFXZcVo', value: 20030}
                            ]

                            /**
                             * TODO : count utxo
                             */
                            wallets.push(transaction.inputs)
                            wallets.push(transaction.outputs)


                            resolve(wallets)
                        } else {
                            reject()
                        }
                    })
                    .catch(reject)
            })
        }
    }

    hasTransaction(id) {
        for (let i = 0; i < this.transactions.length; i++) {
            if (this.transactions[i].id === id) {
                return true
            }
        }
        return false
    }

    getTransactions() {
        return this.transactions
    }

    getTransaction(hash) {
        for (let i = 0; i < this.transactions.length; i++) {
            if (this.transactions[i].hash === hash) {
                return this.transactions[i]
            }
        }
        return null
    }

    removeTransaction(txid) {
        var newTransactions = []
        this.transactions.forEach(function (tx) {
            if (tx.hash !== txid) {
                newTransactions.push(tx)
            }
        });
        this.transactions = newTransactions
    }

    addBlock(block) {
        if (!this.blocks[block.hash]) {
            this.blocks[block.hash] = block
            this.emit('block', block)
        }
    }

    hasBlock(hash) {
        return this.blocks[hash] ? true : false
    }

    getBlock(hash) {
        return this.blocks[hash]
    }

    removeBlock(hash) {
        delete this.blocks[hash]
    }

    getBlocks() {
        return this.blocks
    }
}
