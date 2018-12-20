import MockClient from './development/MockClient'
import logger from '../logger'
import EventEmitter from 'events'

/**
 * Encapsulates all methods of working with the Giant network
 */
export default class GiantNode extends EventEmitter {

    constructor(options) {
        super()

        const self = this
        // TODO need to set up network parameters from giantjs-config.js
        // TODO need to set up current network settings from console arguments
        // TODO then creates a specific client, now for now only use the development network (mock)
        self._client = new MockClient(options)

        self._client.on('ready', () => {
            self.emit('ready')
        })

        self._client.on('error', (err) => {
            self.emit('error', err)
        })
    }

    getAccounts() {
        return this._client.getAccounts()
    }

    getBalance() {
        return this._client.getBalance()
    }

    sendFrom(from, to, amount) {
        return this._client.sendFrom(from, to, amount)
    }

    deployContract(from, code) {
        return this._client.deployContract(from, code,)
    }

    callContract(from, contractAddress, method, args) {
        return this._client.callContract(from, contractAddress, method, args)
    }

    getInfo() {
        this._client.getDB().getMetadata()
            .then((metadata) => {
                logger.info('Blocks : ' + metadata.tipHeight)

                logger.info('Hashes : ')
                console.log(Object.keys(metadata.cache.hashes))

                logger.info('Accounts : ')
                console.log(this._client.getAccounts())

                this._client.getDB().getBlock(metadata.tip)
                    .then((block) => {
                        logger.info('LAST BLOCK v' + block.version + ' : ' + metadata.tip)

                        logger.info('Prev hash : ' + block.prevHash)

                        logger.info('Merkel root  : ' + block.merkleRoot)
                    })
            })
    }

    stop() {
        this._client.stop()
    }
}
