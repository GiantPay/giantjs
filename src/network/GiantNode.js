import MockClient from './development/MockClient'
import logger from '../logger'
import EventEmitter from 'events'
import vm from 'vm'

/**
 * Encapsulates all methods of working with the Giant network
 */
export default class GiantNode extends EventEmitter {

    constructor(options) {
        super()
        this.options = options
        this.vm = vm
        this.contractCalls = new Map()
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

    mountModule(contractAddress, cb) {
        const m = require('module')
        const moduleName = `GMD_${contractAddress}`

        //TODO: get code from chain
        const code = '"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _createClass=function(){function o(e,t){for(var n=0;n<t.length;n++){var o=t[n];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(e,t,n){return t&&o(e.prototype,t),n&&o(e,n),e}}(),_GiantContract=require("../../dist/compile/GiantContract"),_GiantContract2=_interopRequireDefault(_GiantContract);function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn\'t been initialised - super() hasn\'t been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var pfeVars={Program:{count:1,fee:10},StringLiteral:{count:11,fee:4},ExpressionStatement:{count:14,fee:4},Identifier:{count:138,fee:4},MemberExpression:{count:24,fee:4},ObjectProperty:{count:11,fee:4},ObjectExpression:{count:6,fee:4},CallExpression:{count:16,fee:4},VariableDeclarator:{count:7,fee:4},VariableDeclaration:{count:7,fee:4},BinaryExpression:{count:8,fee:4},UpdateExpression:{count:1,fee:4},LogicalExpression:{count:7,fee:4},AssignmentExpression:{count:7,fee:4},IfStatement:{count:7,fee:4},BlockStatement:{count:15,fee:4},ForStatement:{count:1,fee:20},FunctionDeclaration:{count:6,fee:4},ReturnStatement:{count:8,fee:4},FunctionExpression:{count:5,fee:4},ConditionalExpression:{count:3,fee:4},UnaryExpression:{count:6,fee:4},NewExpression:{count:3,fee:4},ThrowStatement:{count:3,fee:4},ThisExpression:{count:4,fee:4},SequenceExpression:{count:0,fee:4},ArrayExpression:{count:2,fee:4},ForInStatement:{count:0,fee:20},WhileStatement:{count:0,fee:20},DoWhileStatement:{count:0,fee:20},WhitePaper:{count:void 0,fee:void 0},getBalance:{count:1,fee:20},address:{count:0,fee:20},buyCoin:{count:0,fee:20},sendCoin:{count:0,fee:20}},Ddd=function(e){function t(){_classCallCheck(this,t);var e=_possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this));return e.balances=[],e}return _inherits(t,_GiantContract2.default),_createClass(t,[{key:"getBalance",value:function(){return this.balances}},{key:"getPfe",value:function(){return pfeVars}}]),t}();function pfe(e){Ddd.pfeVars=e,console.log(e)}exports.default=Ddd;'

        var res = require('vm').runInThisContext(m.wrap(code))(exports, require, module, __filename, __dirname)
        logger.info(`Mount module ${moduleName}`)
        cb(module.exports)
    }

    initContract(contractAddress) {
        this.mountModule(contractAddress, (ContractClass) => {
            console.log(ContractClass)
            this.getContractMeta(contractAddress, (meta) => {
                logger.info(`Contract ${meta.className} metadata`)
                console.log(meta)
                if(typeof global.contracts == 'undefined' ){
                    global.contracts = []
                }
                global.contracts[meta.className] = new ContractClass.default()

                logger.info(`Call method getBalance: ${global.contracts[meta.className].getBalance()}`)

                let pfeVars = global.contracts[meta.className].getPfe()

                //TODO: pfeVars.WhitePaper
                for (let i in pfeVars) {
                    console.log(i + ' ' + pfeVars[i])
                }

                logger.info(`Call method getPfe: ${global.contracts[meta.className].getPfe()}`)

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
