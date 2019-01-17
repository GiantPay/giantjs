import Miner from './Miner'
import Block from './Block'
import Hash from './Hash'
import logger from '../../logger'

import EventEmitter from 'events'
import async from 'async'

import levelup from 'levelup'

export default class Chain extends EventEmitter {

    constructor(options) {
        super()

        const self = this

        this.client = options.client
        this.db = options.db
        this.memPool = options.memPool
        this.wallet = options.wallet
        this.genesis = options.genesis
        this.genesisOptions = options.genesisOptions

        this.blockQueue = []
        this.processingBlockQueue = false

        this.lastSavedMetadata = null
        this.lastSavedMetadataThreshold = 0

        this.cache = {
            hashes: {}, // dictionary of hash -> prevHash
            chainHashes: {}
        }

        this.on('initialized', () => {
            self.initialized = true
            self.emit('ready')
        })

        this.on('ready', () => {
            logger.info('Giant is ready')
            self.ready = true
            if (options.mining) {
                self.startMiner()
            }

            if (self.tip.height === 0) {
                self.emit('genesis')
            }
        })
    }

    initialize() {
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
                    self.db.putBlock(self.genesis, (err) => {
                        if (err) {
                            self.emit('error', err)
                        } else {
                            self.db._onChainAddBlock(self.genesis, (err) => {
                                if (err) {
                                    self.emit('error', err)
                                } else {
                                    self.emit('addblock', self.genesis)
                                    self.saveMetadata()
                                    self.emit('initialized')
                                }
                            })
                        }
                    })
                } else {
                    metadata.tip = metadata.tip
                    self.db.getBlock(metadata.tip)
                        .then((tip) => {
                            self.tip = tip
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

    addBlock(block, callback) {
        this.blockQueue.push([block, callback])
        this._processBlockQueue()
    }

    saveMetadata(callback) {
        const self = this
        callback = callback || function () {
        }

        if (self.lastSavedMetadata && Date.now() < self.lastSavedMetadata.getTime() + self.lastSavedMetadataThreshold) {
            return callback()
        }

        self.db.getMetadata()
            .then((metadata) => {
                let contractsArr = []
                if (typeof metadata != 'undefined' && typeof metadata.contracts != 'undefined') {
                    contractsArr = metadata.contracts
                }

                let contractId = '0x' + Hash.sha256(metadata.contracts.length)

                self.db.getBlock(self.tip.hash)
                    .then((block) => {
                        let contract = {}

                        let contractMetadata = block.data[0].data[0].metadata

                        contractMetadata.version = "1.0"
                        contractMetadata.block = "e0c809c23780435ec5248172f869ba0bb6967425e6679d65c094557b7895c04b"
                        contractMetadata.txid = "13239077a4754a5c41c2621f67efbb0b10bc67babaf9e369ffd58f88202a7b67"
                        contractMetadata.owner = "GUuf1RCuFmLAbyNFT5WifEpZTnLYk2rtVd"
                        contractMetadata.initialized = false
                        contractMetadata.description = "sandbox Contract"
                        contractMetadata.dependencies = {
                            "giant-exchange-api": "^0.1.0",
                            "some-giant-api": "^0.3.6"
                        }

                        contract[contractId] = contractMetadata
                        contractsArr.push(contract)

                        const metadata = {
                            tip: self.tip ? self.tip.hash : null,
                            tipHeight: self.tip && self.tip.height ? self.tip.height : 0,
                            cache: self.cache,
                            contracts: contractsArr
                        }

                        //console.log(contractsArr)

                        self.lastSavedMetadata = new Date()
                        self.db.putMetadata(metadata, callback)
                    })
            })
    }

    getMetadata() {
        self.db.getMetadata()
            .then((metadata) => {
                return metadata
            })
    }

    startMiner() {
        logger.info('startMiner')
        if (!this.miner) {
            this.miner = new Miner({
                db: this.db,
                chain: this,
                memPool: this.memPool,
                wallet: this.wallet
            })
            this.miner.start()
        }
    }

    buildGenesisBlock(options) {
        if (!options) {
            options = {}
        }

        const genesis = new Block({
            prevHash: null,
            height: 0,
            timestamp: options.timestamp
        })
        const data = this.db.buildGenesisData()
        genesis.merkleRoot = data.merkleRoot
        genesis.data = data.data
        return genesis
    }

    stop() {
        if (this.miner) {
            this.miner.stop()
        }
    }

    _validateMerkleRoot(block) {
        const transactions = this.db.getTransactionsFromBlock(block)
        const merkleRoot = this.db.getMerkleRoot(transactions)
        if (!merkleRoot || block.merkleRoot === merkleRoot) {
            return
        }
        return new Error('Invalid merkleRoot for block, expected merkleRoot to equal: ' + merkleRoot + ' instead got: ' + block.merkleRoot)
    }

    _processBlockQueue() {
        var self = this

        if (self.processingBlockQueue) {
            return
        }
        self.processingBlockQueue = true

        async.doWhilst((next) => {
                const item = self.blockQueue.shift()

                logger.info('Processing block', item[0].hash)

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

    _processBlock(block, callback) {
        const merkleError = this._validateMerkleRoot(block)
        if (merkleError) {
            return callback(merkleError)
        }

        async.series([
                this._writeBlock.bind(this, block),
                this._updateTip.bind(this, block)
            ],
            callback
        )
    }

    _writeBlock(block, callback) {
        const self = this

        self.db.getBlock(block.hash)
            .then(() => {
                logger.warn(`Block ${block.hash} already exists, so not writing it again`)
                callback()
            })
            .catch((err) => {
                if (err instanceof levelup.errors.NotFoundError) {
                    block.height = self.tip.height + 1

                    logger.info(`Chain is putting block[${block.height}] to db: ${block.hash}`)

                    self.cache.hashes[block.hash] = block.prevHash
                    self.db.putBlock(block, callback)
                } else if (err) {
                    callback(err)
                }
            })
    }

    _updateTip(block, callback) {
        logger.info(`Chain updating the tip for [${block.height}]`, block.toObject())
        const self = this

        // FIXME check block.prevHash !== self.tip.hash and reorg
        async.series(
            [
                self._validateBlock.bind(self, block),
                self.db._onChainAddBlock.bind(self.db, block)
            ],
            (err) => {
                if (err) {
                    return callback(err)
                }

                self.tip = block

                logger.debug('Saving metadata')
                self.saveMetadata()
                logger.debug('Chain added block to main chain')

                callback()
            }
        )
    }

    _validateBlock(block, callback) {
        logger.info(`Chain is validating block: ${block.hash}`)
        block.validate(this, callback)
    }

    _onMempoolBlock() {
        var self = this
        this.addBlock(block, (err) => {
            if (err) {
                self.emit('error', err)
            }
        })
    }
}
