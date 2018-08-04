import Hash from './Hash'

export default class Block {

    constructor (options) {
        if (!options.hasOwnProperty('prevHash')) {
            throw new TypeError('"prevHash" is expected')
        }
        if (!options.timestamp) {
            throw new TypeError('"timestamp" is expected')
        }

        this.prevHash = options.prevHash
        this.timestamp = options.timestamp
        this.version = options.version || 1
        this.merkleRoot = options.merkleRoot
        this.data = options.data || []

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

    static fromJson (json) {
        return JSON.parse(json)
    }

    toJson () {
        return JSON.stringify({
            hash: this.hash,
            prevHash: this.prevHash,
            version: this.version,
            merkleRoot: this.merkleRoot,
            timestamp: this.timestamp.toISOString(),
            bits: this.bits,
            nonce: this.nonce,
            data: this.data.toString('hex')
        })
    }

    headerToJson () {
        return JSON.stringify({
            version: this.version,
            prevHash: this.prevHash,
            merkleRoot: this.merkleRoot,
            timestamp: this.timestamp
        })
    }

    getHash () {
        return Hash.sha256sha256(this.headerToJson())
    }

    validate (chain, callback) {
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