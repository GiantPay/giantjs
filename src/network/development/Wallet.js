import Transaction from './Transaction'
import logger from '../../logger'
import EventEmitter from 'events'
import colors from 'colors/safe'
import giantConfig from "../../config";

export default class Wallet extends EventEmitter {
    constructor(options) {
        super()

        this.db = options.db
        this.accounts = [
            {
                privateKey: 'YULqUkbYnFT6Fw6YS9Es1H94THRe4BrujuXNgtqT52UMgivrqq7K',
                publicKey: 'GUuf1RCuFmLAbyNFT5WifEpZTnLYk2rtVd',
                premine: 20000
            },
            {
                privateKey: 'YUsc83YuzURjo5eqezyCKUQXAMXets1Ko6edm9paexd7wD8DYhrU',
                publicKey: 'GPLkrYE3GdXDoZMz4zhxyBmTiF1N3AQvpH',
                premine: 20010
            },
            {
                privateKey: 'YVu4osRVAJoXQFDikchxQyfbDWuJGV1AxzCj2QyndQGZex4p6ogv',
                publicKey: 'Gf84TLVMVaEBD1Vb5ZSax39i8VorgB5nC3',
                premine: 20020
            },
            {
                privateKey: 'YUCYpjZzmAQSZfAWg2W6FZdqmAjzV2JcQPSCWJPrLq8UUoS73SEJ',
                publicKey: 'GKFej3xYYzbv8qD5p2Q6CGxQVz1uFXZcVo',
                premine: 20030
            },
            {
                privateKey: 'YVGWKh4k8V9M3fKAMjWpcHVQMHxopPpgob5ooBBhHi2mc8vopHPf',
                publicKey: 'GRfRyKN7wkswAeDrmLvg9JSjfoZd29gkTv',
                premine: 20040
            },
            {
                privateKey: 'YUHPzYgrjch1k7SA8kBwNUMhmYYQmZTZQ2ZuTMjwisFwWxULRVYE',
                publicKey: 'GPe8tZMKBATcvJMu3AY2waXm2Hj6nE3YEM',
                premine: 20050
            },
            {
                privateKey: 'YWReKSYWsbYBg3YVumJ2goETpTc667Na4jwbrLSnWnMv7gLsza2j',
                publicKey: 'GSQoMjQFm2b942Z9AnGHnfGSspuAZbcfJa',
                premine: 20060
            },
            {
                privateKey: 'YSrY4bh7q2sZNq1NskriUbo8B7UAdf8XHxuh752c3u3Xq1TzTgpN',
                publicKey: 'GbHkZrS9X6LRifRY73pA87ZuUw4Nn7nd3a',
                premine: 20070
            },
            {
                privateKey: 'YT7Qf6U5CMCxg9oqpT1Z3UVCqx4czSj3gJxLJH6TU74gHCR8T9eE',
                publicKey: 'GJrnCVYHuzNMNkHstvmUxY6znp5iTcXAmB',
                premine: 20080
            },
            {
                privateKey: 'YTGiw1qxeQFgJTRDwVGwMEXkSCxyxXWcYLGeRHMYekvhECaSiE5P',
                publicKey: 'GcKg5sgUUXFLxhKoScUFMQMN95iFbrkqVa',
                premine: 20090
            }
        ]
    }

    initialize() {
        this.db.on('addblock', (block) => this._processBlock(block))
        this.emit('ready')

        this._showWarning()
    }

    premine() {
        let transaction = Transaction.generation()

        this.accounts.forEach((account) => {
            transaction.outputs.push({
                to: account.publicKey,
                value: account.premine
            })
        })

        return transaction
    }

    getAccounts() {
        return this.accounts.map((key) => key.publicKey)
    }

    getBalance() {
        return 1000
    }

    _loadUnpentOutputs() {

    }

    _processBlock(block) {
        block.data.forEach((transaction) => {


        })
    }

    _showWarning() {
        logger.warn(`Giant Development Network started debug ${giantConfig.debug}`)

        if (giantConfig.debug) {
            let warn = ''

            this.accounts.forEach((account, i) => {
                warn += `(${i}) ${account.publicKey}\n`
            })
            warn += '\nPrivate Keys:\n'
            this.accounts.forEach((account, i) => {
                warn += `(${i}) ${account.privateKey}\n`
            })

            logger.warn(warn)
        }

        logger.warn(colors['yellow'].bold('\n⚠️  Important ⚠️  : These keys were created for you by giantjs. It is not secure.\n' +
            'Ensure you do not use it on production blockchains, or else you risk losing funds.\n\n'))

    }
}