import MockClient from './development/MockClient'
import logger from '../logger'
import EventEmitter from 'events'
import vm from 'vm'
import fs from 'fs'
import path from 'path'
import giantConfig from '../config'

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

    getCaller() {
        return this._client
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
                        const tx = block.data[0]
                        console.log(tx.type)
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

    initMethod(options) {
        logger.warn(`Call method GiantContract.${options.method}`)
        console.log(options)
        this.contracts[options.contractName][options.method](options.args)

        /**
         * getLastContractReceipts
         *
         * receipt:
          {
  "transactionHash": "0x9fc76417374aa880d4449a1f7f31ec597f00b1f6f3dd2d66f4c9c6c445836d8b",
  "transactionIndex": 0,
  "blockHash": "0xef95f2f1ed3ca60b048b4bf67cde2195961e0bba6f70bcbea9a2c4e133e34b46",
  "blockNumber": 3,
  "contractAddress": "0xa94f5374fce5edbc8e2a8697c15331677e6ebf0b",
  "cumulativeGicUsed": 314159,
  «gicUsed": 30234,
  "logs": [],
  "status": "0x1"
         }
         */
    }

    initContract(contractAddress, cb) {
        const self = this

        this.mountModule(contractAddress, (ContractClass) => {
            //console.log(ContractClass)

            this.getContractMeta(contractAddress, (metadata) => {
                logger.info(`Contract ${metadata.className} metadata`)

                if (typeof this.contracts == 'undefined') {
                    this.contracts = []
                }

                this.contracts[metadata.className] = new ContractClass.default()

                cb(metadata)
            })
        })
    }

    whitePaperFee(metadata) {
        let metaMethodsList = [] //metadata methods list

        for (let i in metadata.methods) {
            metaMethodsList.push(metadata.methods[i].name)
        }

        const pfeVars = this.contracts[metadata.className].getPfe()

        const metaMethodsListStr = metaMethodsList.toString()

        for (let m in pfeVars) {
            /**
             * Check and update method in metadata
             */
            if (metaMethodsListStr.indexOf(m) + 1) {
                for (let i in metadata.methods) {
                    if (metadata.methods[i].name == m) {
                        metadata.methods[i].params.push({'wp': true, 'initialized': false})
                        metadata.methods[i].fee = pfeVars[m].fee
                    }
                }
            }
        }
        return metadata
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
                if (giantConfig.debug) {
                    for (var c in metadata.contracts) {
                        for (var k in metadata.contracts[c]) {
                            logger.info(`contract ${metadata.contracts[c][k].className}  ${k} `)
                        }
                    }
                }
                cb(metadata.contracts)
            })
    }

    checkContractAddress(address, cb) {
        let testContractName = address.split('0x')

        if (typeof testContractName[1] != 'undefined') {
            if (testContractName[1].length = 64) {
                logger.info(`Contract address is well formed`)

                cb(address)
            }
        } else {
            logger.info(`Contract address is not well formed, check by a contract name`)
            let name = address

            if (name == 'last') {
                this.getLastContract(contractAddress => {
                    logger.info(`Found last contract ${contractAddress}`)

                    cb(contractAddress)
                })
            } else {
                this._client.getDB().getMetadata()
                    .then((metadata) => {
                        let contractNameArr = []

                        for (var c in metadata.contracts) {
                            for (var k in metadata.contracts[c]) {
                                if (name == metadata.contracts[c][k].className) {
                                    contractNameArr.push(k)

                                    logger.info(`contract ${metadata.contracts[c][k].className}  ${k} `)
                                }
                            }
                        }

                        if (contractNameArr.length) {
                            if (contractNameArr.length == 1) {
                                logger.info(`Found contract ${metadata.contracts.length} ${name}`)

                                cb(contractNameArr[0])
                            }

                            if (contractNameArr.length > 1) {
                                let last = contractNameArr[contractNameArr.length - 1]

                                logger.info(`Found ${metadata.contracts.length} times contract ${name}, try last ${last}`)

                                cb(last)
                            }
                        } else {
                            logger.info(`Contract by name ${name} not found`)

                            cb(false)
                        }
                    })
            }
        }
    }

    getLastContract(cb) {
        let contractAddress = ''

        this.getAllContracts((contracts) => {
            if (!contracts.length) {
                console.log("Contracts not found")
                return
            }

            for (let i in contracts) {
                for (let c in contracts[i]) {
                    contractAddress = c
                }
            }
            cb(contractAddress)
        })
    }

    getInfo(options) {
        console.log(this.options)
        this._client.getDB().getMetadata()
            .then((metadata) => {
                if (typeof metadata.cache != 'undefined') {
                    logger.info(`Network ${options.network} ${metadata.tipHeight} Blocks`)

                    logger.info(`Hashes`)
                    console.log(Object.keys(metadata.cache.hashes))


                    logger.info(`Accounts`)
                    console.log(this._client.getAccounts())

                    logger.info(`Contracts ${metadata.contracts.length}`)

                    for (var c in metadata.contracts) {
                        for (var k in metadata.contracts[c]) {
                            logger.info(`contract ${metadata.contracts[c][k].className}  ${k} `)
                            logger.info(`txid ${metadata.contracts[c][k].txid}  `)
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
                } else {
                    logger.info(`Blocks not found`)
                }
            })
    }

    getPrevTxId(cb) {
        this._client.getDB().getMetadata()
            .then((metadata) => {
                if (typeof metadata.tip != 'undefined') {
                    this._client.getDB().getBlock(metadata.tip)
                        .then((block) => {
                            //block.data[0].txid
                            cb(block.data[0].txid)
                        })
                } else {
                    logger.info(`Blocks not found`)
                }
            })
    }

    stop() {
        this._client.stop()
    }
}
