import Block from './Block'

import whilst from 'async/whilst'

export default class Miner {

    constructor (options) {
        this.db = options.db
        this.chain = options.chain
        this.memPool = options.memPool
        this.started = false
        this.blockTime = options.blockTime || 500
    }

    start () {
        console.log('Started miner')
        this.started = true
        this.mineBlocks()
    }

    stop () {
        console.log('Stopped miner')
        this.started = false
    }

    mineBlocks () {
        const self = this

        whilst(
            () => self.started,
            (callback) => {
                self.mineBlock(function () {
                    setTimeout(callback, self.blockTime)
                })
            },
            (err) => {
                if (err) {
                    console.error(err)
                }
            }
        )
    }

    mineBlock (callback) {
        const self = this
        const memPoolTransactions = self.memPool.getTransactions()

        console.log('mb: ', memPoolTransactions)

        if (memPoolTransactions.length) {
            let transactions = []
            transactions = transactions.concat(memPoolTransactions)
            const block = new Block({
                prevHash: self.chain.tip.hash,
                timestamp: new Date()
            })

            self.db.addTransactionsToBlock(block, transactions)

            console.log('Builder built block ' + block.hash)

            self.chain.addBlock(block, (err) => {
                if (err) {
                    self.chain.emit('error', err)
                } else {
                    console.log('Builder successfully added block ' + block.hash + ' to chain')
                }
                callback()
            })
        } else {
            callback()
        }
    }
}
