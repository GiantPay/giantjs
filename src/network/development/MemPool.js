import EventEmitter from 'events'
import Contract from "./Contract";

export default class MemPool extends EventEmitter {

    constructor(options) {
        super()
        this.db = options.db
        this.blocks = []
        this.transactions = []
    }

    addTransaction(transaction) {
        const self = this

        //TODO   transaction.validate()

        return new Promise((resolve, reject) => {
            transaction.validate()
                .then((result) => {
                    if (!self.hasTransaction(transaction.hash)) {
                        self.transactions.push(transaction)
                        self.emit('transaction', transaction)
                        resolve(result)
                    } else {
                        resolve(result)
                    }
                })
                .catch(reject)
        })
    }

    hasTransaction(hash) {
        for (let i = 0; i < this.transactions.length; i++) {
            if (this.transactions[i].hash === hash) {
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
