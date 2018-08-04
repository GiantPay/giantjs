import GiantPath from '../../path'
import MemPool from './MemPool'
import Block from './Block'
import Hash from './Hash'

import EventEmitter from 'events'
import async from 'async'

import jsondiffpatch from 'jsondiffpatch'
import levelup from 'levelup'
import leveldown from 'leveldown'

const PREFIXES = {
    TX: 'tx',
    BLOCK: 'blk',
    DATA: 'data',
    WEI: 'wt',
    PREV_HASH: 'ph'
}

export default class Database extends EventEmitter {

    constructor (options) {
        super()
        if (!options) {
            options = {}
        }

        this.store = levelup(leveldown(GiantPath.getNetworkPath(options.network)))
        this.memPool = options.memPool = new MemPool({
            db: this
        })
    }

    initialize () {
        this.emit('ready');
    }

    buildGenesisData () {
        return {
            merkleRoot: null,
            data: []
        }
    }

    putMetadata (metadata, callback) {
        this.store.put('metadata', JSON.stringify(metadata), {}, callback)
    }

    getMetadata () {
        const self = this

        return new Promise((resolve, reject) => {
            self.store.get('metadata', {}, (err, data) => {
                if (err instanceof levelup.errors.NotFoundError) {
                    resolve({})
                } else if (err) {
                    reject(err)
                } else {
                    try {
                        resolve(JSON.parse(data))
                    } catch (e) {
                        reject(new Error('Could not parse metadata'))
                    }
                }
            })
        })
    }

    getBlock (hash) {
        const self = this

        return new Promise((resolve, reject) => {
            const key = `${PREFIXES.BLOCK}-${hash}`
            const options = {
                valueEncoding: 'hex'
            }

            self.store.get(key, options, (err, blockData) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(Block.fromJson(blockData))
                }
            })
        })
    }

    putBlock (block) {
        const self = this

        return new Promise((resolve, reject) => {
            const key = `${PREFIXES.BLOCK}-${block.hash}`
            const options = {
                valueEncoding: 'hex'
            }

            this.store.put(key, block.toJson(), options, (err) => {
                if (err) {
                    reject(err)
                } else {
                    self._updatePrevHashIndex(block, resolve, reject)
                }
            });
        })
    }

    addTransactionsToBlock (block, transactions) {
        let txs = this.getTransactionsFromBlock(block)
        txs = txs.concat(transactions)
        block.merkleRoot = this.getMerkleRoot(txs)
        block.data = txs
    }

    getTransactionsFromBlock (block) {
        // TODO in mock client - block.data is JSON array of transactions, not byte buffer
        return block.data
    }

    getMerkleRoot (transactions) {
        const tree = this.getMerkleTree(transactions)
        const merkleRoot = tree[tree.length - 1]
        if (!merkleRoot) {
            return null
        } else {
            return merkleRoot
        }
    }

    validateBlockData (block, callback) {
        const self = this
        const transactions = self.getTransactionsFromBlock(block)

        async.each(transactions, (transaction, done) => {
            transaction.validate().finally(() => done())
        }, callback)
    }

    getMerkleTree (transactions) {
        var tree = transactions.map((tx) => tx.hash)

        var j = 0
        var size = transactions.length
        for (; size > 1; size = Math.floor((size + 1) / 2)) {
            for (let i = 0; i < size; i += 2) {
                const i2 = Math.min(i + 1, size - 1)
                const buf = [tree[j + i], tree[j + i2]]
                tree.push(Hash.sha256sha256(buf))
            }
            j += size
        }
        return tree
    }

    put (key, value) {
        const self = this
        return new Promise((resolve, reject) => {


        })
    }

    get (key) {

    }

    getDiff (key, value, callback) {
        var self = this;

        self.get(key, function (err, oldValue) {
            if (err && !(err instanceof levelup.errors.NotFoundError)) {
                return callback(err);
            }

            var diff;
            try {
                var oldValueObject = JSON.parse(oldValue);
                var valueObject = JSON.parse(value);
                diff = jsondiffpatch.diff(oldValueObject, valueObject);
            } catch (e) {
                diff = jsondiffpatch.diff(oldValue, value);
            }

            callback(null, diff);
        });
    }

    _onChainAddBlock (block) {
        var self = this

        console.log('DB handling new chain block')

        return new Promise((resolve, reject) => {
            // Remove block from mempool
            self.memPool.removeBlock(block.hash)

            async.series([
                self._updateTransactions.bind(self, block, true), // add transactions
                self._updateValues.bind(self, block, true) // update values
            ], (err, results) => {
                if (err) {
                    reject(err)
                } else {
                    let operations = []
                    for (let i = 0; i < results.length; i++) {
                        operations = operations.concat(results[i])
                    }

                    console.log('Updating the database with operations', operations)

                    self.store.batch(operations, (err) => {
                        if (err) {
                            reject(err)
                        } else {
                            resolve()
                        }
                    })
                }
            });
        })
    }

    _updatePrevHashIndex (block, resolve, reject) {
        this.store.put(`${PREFIXES.PREV_HASH}-${block.hash}`, block.prevHash, (err) => {
            if (err) {
                reject(err)
            } else {
                resolve()
            }
        })
    }

    _updateTransactions (block, add, callback) {
        const self = this
        const txs = self.getTransactionsFromBlock(block)

        console.log('Updating transactions')

        const action = add ? 'put' : 'del'
        let operations = []

        for (let txCount = 0; txCount < txs.length; txCount++) {
            const tx = txs[txCount]
            const txid = tx.id
            const blockHash = block.hash

            operations.push({
                type: action,
                key: `${PREFIXES.TX}-${txid}`,
                value: `${blockHash}:${txCount}`
            })

            if (add) {
                self.memPool.removeTransaction(txid)
            } else {
                this.memPool.addTransaction(tx)
            }
        }
        callback(null, operations)
    }

    _updateValues (block, add, callback) {
        const self = this
        const operations = []
        const action = add ? '_patch' : '_unpatch'

        const transactions = self.getTransactionsFromBlock(block)
        async.each(transactions, (transaction, next) => {
            async.each(transaction.diffs, (data, next) => {
                var key = data[0]
                var diff = data[1]

                self[action].call(self, key, diff, (err, operation) => {
                    if (err) {
                        return next(err)
                    }

                    operations.push(operation)
                    next()
                })
            }, next)
        }, (err) => {
            callback(err, operations)
        })
    }

    _patch (key, diff, callback) {
        const self = this

        self.get(key, (err, original) => {
            if (err && !(err instanceof levelup.errors.NotFoundError)) {
                return callback(err);
            }

            let newValue;
            try {
                const originalObject = JSON.parse(original)
                newValue = jsondiffpatch.patch(originalObject, diff)
            } catch (e) {
                newValue = jsondiffpatch.patch(original, diff)
            }

            callback(null, {
                type: 'put',
                key: `${PREFIXES.DATA}-${key}`,
                value: newValue
            })
        });
    }

    _unpatch (key, diff, callback) {
        const self = this

        self.get(key, (err, original) => {
            if (err) {
                return callback(err)
            }

            let newValue
            try {
                const originalObject = JSON.parse(original)
                newValue = jsondiffpatch.unpatch(originalObject, diff)
            } catch (e) {
                newValue = jsondiffpatch.unpatch(original, diff)
            }

            callback(null, {
                type: newValue ? 'put' : 'del',
                key: `${PREFIXES.DATA}-${key}`,
                value: newValue
            })
        })
    }
}