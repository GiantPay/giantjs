import MockClient from './development/MockClient'
import logger from '../logger'
import EventEmitter from 'events'
import vm from 'vm'
import fs from 'fs'
import path from 'path'

/**
 * Encapsulates all methods of working with the Giant network
 */
export default class GiantNode extends EventEmitter {

    constructor(options) {
        super()
        this.options = options
        this.vm = vm
        this.contractCalls = new Map()
        this.contracts = []
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

    deployContract(options) {
        return this._client.deployContract(options)
    }

    getLastContractFromTip(cb) {
        this._client.getDB().getMetadata()
            .then((metadata) => {
                this._client.getDB().getBlock(metadata.tip)
                    .then((block) => {
                        // TODO : check Wallet

                        const tx = block.data[0]
                        console.log(tx.type)
                        /**
                         * TODO : tx.type == 'call' validation logic then cb(tx.code.runTime.code)
                         */

                        //if tx.type == 'deploy'
                        cb(tx.data[0].code.runTime.code)
                    })
            })
    }

    getLastContractFromFs(cb) {
        // TODO : move to tests
        let contractPath = './build/contracts/',
            latestContract = (() => {
                let latest;
                const files = fs.readdirSync(contractPath);
                files.forEach(filename => {
                    const stat = fs.lstatSync(path.join(contractPath, filename));
                    if (stat.isDirectory())
                        return;
                    if (!latest) {
                        latest = {filename, mtime: stat.mtime};
                        return;
                    }
                    if (stat.mtime > latest.mtime) {
                        latest.filename = filename;
                        latest.mtime = stat.mtime;
                    }
                });
                return latest.filename;
            })()

        let runTimeName = latestContract.slice(0, -3) + 'RunTime.js'

        fs.readFile(contractPath + runTimeName, {encoding: 'utf-8'}, function (err, code) {
            if (!err) {
                cb(code)
            } else {
                console.log(err);
            }
        });
    }

    mountModule(contractAddress, cb) {
        const m = require('module')
        const moduleName = `GMD_${contractAddress}`
        this.getLastContractFromTip((code) => {
            console.log(code)
            var res = require('vm').runInThisContext(m.wrap(code))(exports, require, module, __filename, __dirname)
            logger.info(`Mount module ${moduleName}`)
            cb(module.exports)
        })
    }

    initContract(contractAddress) {

        this.mountModule(contractAddress, (ContractClass) => {

            console.log(ContractClass)

            this.getContractMeta(contractAddress, (meta) => {

                logger.info(`Contract ${meta.className} metadata`)

                console.log(meta)

                if (typeof this.contracts == 'undefined') {
                    this.contracts = []
                }

                this.contracts[meta.className] = new ContractClass.default()

                logger.info(`Call method getBalance: ${this.contracts[meta.className].getBalance()}`)

                let pfeVars = this.contracts[meta.className].getPfe()

                //TODO: pfeVars.WhitePaper
                for (let i in pfeVars) {
                    if (i == 'WhitePaper') {
                        console.log(`pfeVars.WhitePaper ${i} ${pfeVars[i]}`)
                    }
                }

                logger.info(`Call method getPfe: ${this.contracts[meta.className].getPfe()}`)
            })
        })
    }

    callContract(from, contractAddress, method, args) {
        return this._client.callContract(from, contractAddress, method, args)
    }

    getContractMeta(contractAddress, cb) {
        const contract = this._client.getDB().getMetadata()
            .then((metadata) => {
                logger.info(`Contracts ${metadata.contracts.length}`)
                for (let c in metadata.contracts) {
                    for (let k in metadata.contracts[c]) {
                        if (k == contractAddress) {
                            if (typeof metadata.contracts[c][k].dependencies == 'object') {
                                logger.info(`Contract ${metadata.contracts[c][k].className} \n${k} `)
                                logger.info(`Contract description: ${metadata.contracts[c][k].description}`)
                                logger.info(`Contract block: ${metadata.contracts[c][k].block}`)
                                logger.info(`Initialized: ${metadata.contracts[c][k].initialized}`)
                            }
                            //registration of the mounted contracts in giantNode.contractCalls Map
                            this.contractCalls.set(contractAddress, metadata.contracts[c][k])
                            logger.warn(`Initializing Contract ${metadata.contracts[c][k].className}`)
                        }
                    }
                }
                const contract = this.contractCalls.get(contractAddress)
                console.log(contract.className)
                console.log(contract.methods)
                cb(contract)
            })
    }

    getAllContracts(cb) {
        this._client.getDB().getMetadata()
            .then((metadata) => {
                logger.info(`Contracts ${metadata.contracts.length}`)
                for (var c in metadata.contracts) {
                    for (var k in metadata.contracts[c]) {
                        logger.info(`contract ${metadata.contracts[c][k].className}  ${k} `)
                    }
                }
                cb(metadata.contracts)
            })
    }

    getInfo(options) {
        console.log(this.options)
        this._client.getDB().getMetadata()
            .then((metadata) => {
                logger.info(`Network ${options.network} ${metadata.tipHeight} Blocks`)

                logger.info(`Hashes`)
                console.log(Object.keys(metadata.cache.hashes))

                logger.info(`Accounts`)
                console.log(this._client.getAccounts())

                logger.info(`Contracts ${metadata.contracts.length}`)

                for (var c in metadata.contracts) {
                    for (var k in metadata.contracts[c]) {
                        logger.info(`contract ${metadata.contracts[c][k].className}  ${k} `)
                    }
                }

                this._client.getDB().getBlock(metadata.tip)
                    .then((block) => {
                        //console.log(block)
                        logger.info(`
                        LAST BLOCK v${block.version} : ${metadata.tip}
                        --------------------------------------------------------------------------------
                        Prev hash : ${block.prevHash}
                        Merkel root : ${block.merkleRoot} 
                        Height: : ${block.height} 
                        Timestamp : ${block.timestamp} 
                        Nonce : ${block.nonce}
                        `)
                    })
            })
    }

    stop() {
        this._client.stop()
    }
}
