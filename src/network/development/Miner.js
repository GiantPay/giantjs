import giantConfig from '../../config'
import Block from './Block'
import Wallet from './Wallet'
import logger from '../../logger'
import TransactionType from './TransactionType'

import async from 'async'

export default class Miner {

    constructor(options) {
        const self = this

        this.db = options.db
        this.chain = options.chain
        this.memPool = options.memPool
        this.wallet = options.wallet
        this.started = false
        this.blockTime = options.blockTime || giantConfig.blockTime

        this.chain.on('genesis', () => {
            self.wallet.premine()
        })
    }

    start() {
        logger.info('Started miner')
        this.started = true
        this.mineBlocks()
    }

    stop() {
        logger.info('Stopped miner')
        this.started = false
    }

    mineBlocks() {
        const self = this

        async.whilst(
            () => self.started,
            (callback) => {
                self.mineBlock(function () {
                    setTimeout(callback, self.blockTime)
                })
            },
            (err) => {
                if (err) {
                    logger.error(err)
                }
            }
        )
    }

    getPrevTx() {
        //if first tx - return null
        return
    }

    getReceipient() {
        let receipient = Math.floor((Math.random() * 10) + 2)

        if (typeof this.wallet.accounts[receipient] == 'undefined') {
            return this.wallet.accounts[1] //chainOwner
        }

        logger.info(`Found receipient :  ${this.wallet.accounts[receipient].publicKey}`)

        logger.info(`Receipient balance:  ${this.wallet.accounts[receipient].premine} GIC`)

        return this.wallet.accounts[receipient]
    }

    getCallerAddress() {
        return this.wallet.accounts[0]
    }


    mineBlock(callback) {
        const self = this
        const memPoolTransactions = self.memPool.getTransactions()

        if (memPoolTransactions.length) {
            let transactions = []
            transactions = transactions.concat(memPoolTransactions)
            const block = new Block({
                prevHash: self.chain.tip.hash
            })
            self.db.validateBlockData(block, () => {

                self.db.addTransactionsToBlock(block, transactions)

                logger.debug(`Builder built block ${block.hash}`)

                self.chain.addBlock(block, (err) => {
                    if (err) {
                        self.chain.emit('error', err)
                    } else {
                        logger.debug(`Builder successfully added block ${block.hash} to chain`)
                    }
                    callback()
                })
            })
        } else {
            callback()
            logger.debug('miner: transaction doesn\'t found')
        }
    }
}
