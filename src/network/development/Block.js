import Hash from './Hash'
import Transaction from './Transaction'

export default class Block {

    constructor(options) {
        if (!options) {
            throw new TypeError('"options" is expected')
        }
        if (!options.hasOwnProperty('prevHash')) {
            throw new TypeError('"prevHash" is expected')
        }

        this.prevHash = options.prevHash
        this.timestamp = options.timestamp || new Date().getTime()
        this.version = options.version || 1
        this.merkleRoot = options.merkleRoot
        this.data = options.data || []
        if (!Array.isArray(this.data)) {
            throw new TypeError('"data" is expected to be an array')
        }
        /***
         *  TODO :
         *  some losses when store like array of instances of Transaction
         *
         if (this.data.length && !(this.data[0] instanceof Transaction)) {
            this.data = this.data.map(tx => new Transaction(tx))
         }

         *
         * this.data = 2 transaction transfer, deploy
         *


         { type: 'transfer',
             data: [ { feePrice: 10 } ],
             inputs: [],
             outputs: [] },
         { type: 'deploy',
             data:
             [ { contractName: 'M',
                 contractCode:

                 ...
          *
          *
          *

          let tx = new Transaction(this.data[1])
          this.data = [tx]

          */

        this.height = options.height || 0
        this.bits = options.bits || 0
        this.nonce = options.nonce || 0

        Object.defineProperty(this, 'hash', {
            configurable: false,
            enumerable: true,
            get: function () {
                return this.getHash()
            },
            set: function () {
            }
        })
    }

    static fromJson(json) {
        return new Block(JSON.parse(json))
    }

    toObject() {
        return {
            hash: this.hash,
            prevHash: this.prevHash,
            version: this.version,
            merkleRoot: this.merkleRoot,
            timestamp: this.timestamp,
            bits: this.bits,
            nonce: this.nonce,
            height: this.height,
            data: this.data ? this.data.map(tx => tx.toObject()) : []
        }
    }

    toHeader() {
        return {
            version: this.version,
            prevHash: this.prevHash,
            merkleRoot: this.merkleRoot,
            timestamp: this.timestamp,
            bits: this.bits,
            nonce: this.nonce
        }
    }

    toJson() {
        return JSON.stringify(this.toObject())
    }

    headerToJson() {
        return JSON.stringify(this.toHeader())
    }

    getHash() {
        return Hash.sha256sha256(this.headerToJson())
    }

    validate(chain, callback) {
        const self = this

        chain.db.getBlock(self.prevHash)
            .then((block) => {
                if (!block.timestamp) {
                    return callback(new Error('Block timestamp is required'))
                }
                // Validate block data
                chain.db.validateBlockData(self, callback)
            })
            .catch((err) => {
                callback(err)
            })
    }
}