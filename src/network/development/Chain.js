import Miner from './Miner'
import Block from './Block'

import EventEmitter from 'events'
import async from 'async'

import levelup from 'levelup'

export default class Chain extends EventEmitter {

    constructor (options) {
        super()

        const self = this

        this.client = options.client
        this.db = options.db
        this.memPool = options.memPool
        this.genesis = options.genesis
        this.genesisOptions = options.genesisOptions

        this.blockQueue = []
        this.processingBlockQueue = false

        this.lastSavedMetadata = null
        this.lastSavedMetadataThreshold = 0

        this.on('initialized', () => {
            self.initialized = true
            self.emit('ready')
        })

        this.on('ready', () => {
            console.log('Giant is ready')
            self.ready = true
            self.startMiner()
        })
    }

    initialize () {
        const self = this

        if (!this.genesis) {
            self.genesis = self.buildGenesisBlock(this.genesisOptions)
        }

        const merkleError = self._validateMerkleRoot(self.genesis)
        if (merkleError) {
            throw merkleError
        }

        // FIXME
        self.db.memPool.on('block', self._onMempoolBlock.bind(self))

        self.db.getMetadata()
            .then((metadata) => {
                if (!metadata || !metadata.tip) {
                    self.tip = self.genesis
                    self.tip.__height = 0
                    // self.tip.__weight = self.genesisWeight
                    self.db.putBlock(self.genesis)
                        .then(() => {
                            self.db._onChainAddBlock(self.genesis)
                                .then(() => {
                                    self.emit('addblock', self.genesis)
                                    self.saveMetadata()
                                    self.emit('initialized')
                                })
                                .catch((err) => {
                                    self.emit('error', err)
                                })
                        })
                        .catch((err) => {
                            return self.emit('error', err)
                        })
                } else {
                    metadata.tip = metadata.tip
                    self.db.getBlock(metadata.tip)
                        .then((tip) => {
                            self.tip = tip
                            self.tip.__height = metadata.tipHeight
                            // self.tip.__weight = new BN(metadata.tipWeight, 'hex')
                            self.cache = metadata.cache
                            self.emit('initialized')
                        })
                        .catch((err) => {
                            self.emit('error', err)
                        })
                }
            })
            .catch((err) => {
                self.emit('error', err)
            })
    }

    addBlock (block, callback) {
        this.blockQueue.push([block, callback])
        this._processBlockQueue()
    }

    saveMetadata (callback) {
        const self = this
        callback = callback || function () {
        }

        if (self.lastSavedMetadata && Date.now() < self.lastSavedMetadata.getTime() + self.lastSavedMetadataThreshold) {
            return callback()
        }

        var metadata = {
            tip: self.tip ? self.tip.hash : null,
            tipHeight: self.tip && self.tip.__height ? self.tip.__height : 0,
            // tipWeight: self.tip && self.tip.__weight ? self.tip.__weight.toString(16) : '0',
            cache: self.cache
        }

        self.lastSavedMetadata = new Date()
        self.db.putMetadata(metadata, callback)
    }

    startMiner () {
        console.log('startMiner')
        if (!this.miner) {
            this.miner = new Miner({
                db: this.db,
                chain: this,
                memPool: this.memPool
            })
            this.miner.start()
        }
    }

    buildGenesisBlock (options) {
        if (!options) {
            options = {}
        }

        const genesis = new Block({
            prevHash: null,
            height: 0,
            timestamp: options.timestamp || new Date()
        })
        const data = this.db.buildGenesisData()
        genesis.merkleRoot = data.merkleRoot
        genesis.data = data.data
        return genesis
    }

    _validateMerkleRoot (block) {
        const transactions = this.db.getTransactionsFromBlock(block)
        const merkleRoot = this.db.getMerkleRoot(transactions)
        if (!merkleRoot || block.merkleRoot === merkleRoot) {
            return
        }
        return new Error('Invalid merkleRoot for block, expected merkleRoot to equal: ' + merkleRoot + ' instead got: ' + block.merkleRoot)
    }

    _processBlockQueue () {
        var self = this

        if (self.processingBlockQueue) {
            return
        }
        self.processingBlockQueue = true

        async.doWhilst((next) => {
                const item = self.blockQueue.shift()

                console.log('Processing block', item[0].hash)

                self._processBlock(item[0], (err) => {
                    item[1].call(self, err)
                    next()
                })
            }, () => {
                return self.blockQueue.length
            }, () => {
                self.processingBlockQueue = false
                self.emit('queueprocessed')
            }
        )
    }

    _processBlock (block, callback) {
        const merkleError = this._validateMerkleRoot(block)
        if (merkleError) {
            return callback(merkleError)
        }

        async.series([
                this._writeBlock.bind(this, block),
                this._updateWeight.bind(this, block),
                this._updateTip.bind(this, block)
            ],
            callback
        )
    }

    _writeBlock (block, callback) {
        const self = this

        self.db.getBlock(block.hash)
            .then(() => {
                console.log('Block ' + block.hash + ' already exists, so not writing it again')
                callback()
            })
            .catch((err) => {
                if (err instanceof levelup.errors.NotFoundError) {
                    console.log('Chain is putting block to db:' + block.hash)

                    self.cache.hashes[block.hash] = block.prevHash
                    self.db.putBlock(block, callback)
                } else if (err) {
                    callback(err)
                }
            })
    }

    _updateWeight (block, callback) {
        // const self = this
        // Update weights
        // self.getWeight(block.hash, function (err, weight) {
        //     if (err) {
        //         return callback(new Error('Could not get weight for block ' + block.hash + ': ' + err))
        //     }
        //
        //     log.debug('Chain calculated weight as ' + weight.toString('hex'))
        //
        //     block.__weight = weight
        //
        //     self.db._updateWeight(block.hash, block.__weight, callback)
        // })
    }

    _updateTip (block, callback) {
        console.log(`Chain updating the tip for: ${block.hash}`)
        const self = this

        // TODO check block.prevHash !== self.tip.hash and reorg
        // Populate height
        block.__height = self.tip.__height + 1
        async.series(
            [
                self._validateBlock.bind(self, block),
                self.db._onChainAddBlock.bind(self.db, block)
            ],
            (err) => {
                if (err) {
                    return callback(err)
                }

                delete self.tip.__transactions
                self.tip = block

                console.log('Saving metadata')
                self.saveMetadata()
                console.log('Chain added block to main chain')

                self.emit('addblock', block)
                callback()
            }
        )
    }

    _validateBlock (block, callback) {
        console.log('Chain is validating block: ' + block.hash)
        block.validate(this, callback)
    }

    _onMempoolBlock () {
        var self = this
        this.addBlock(block, (err) => {
            if (err) {
                self.emit('error', err)
            }
        })
    }
}
