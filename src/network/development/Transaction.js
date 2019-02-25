import giantConfig from '../../config'
import Hash from './Hash'
import TransactionType from './TransactionType'
import Contract from './Contract'
import logger from "../../logger"

export default class Transaction {

    constructor(options) {
        this.options = options
        giantConfig.debug = true
        logger.warn(`Transaction constructor(options) debug ${giantConfig.debug}`)
        if (giantConfig.debug) {
            console.log(options)
        }
        this.type = options.type || TransactionType.TRANSFER

        this.feePrice = options.feePrice || giantConfig.feePrice

        if (typeof options.contractName != 'undefined') {
            let contract = new Contract(options)
            this.data = [contract]
        }

        this.contractAddress = options.contractAddress

        this.inputs = options.inputs || this.getInputs()

        this.prevBlockHash = options.prevBlockHash

        this.prevTxId = options.prevTxId

        this.txId = this.getHash()

        this.outputs = options.outputs || this.getOutputs()

        const hashProperty = {
            configurable: false,
            writeable: false,
            get: () => this.getHash(),
            set: () => {
            }
        }

        Object.defineProperty(this, 'hash', hashProperty)

        Object.defineProperty(this, 'id', hashProperty)
        /**
         * hashProperty not unique
         * unique
         * transaction.id = Hash.sha256(transaction.getHash() + block.prevHash)
         */
    }

    static generation() {
        return new Transaction({
            type: TransactionType.GENERATION,
            inputs: [{
                coinbase: '000000000000000000000000000000000000000000000000',
                sequence: 0
            }]
        })
    }

    static sendFrom() {
        return new Transaction({type: TransactionType.TRANSFER})
    }

    static deployContract(options) {
        options.type = TransactionType.CONTRACT_DEPLOY
        return new Transaction(options)
    }

    static callContract() {
        return new Transaction({
            type: TransactionType.CONTRACT_CALL
        })
    }

    toObject() {
        const json = {
            type: this.type,
            data: this.data,
            inputs: this.inputs,
            outputs: this.outputs,
            prevBlockHash: this.prevBlockHash
        }

        if (this.type === TransactionType.CONTRACT_DEPLOY || this.type === TransactionType.CONTRACT_CALL) {
            json.feePrice = this.feePrice
        }
        return json
    }

    toJson() {
        return JSON.stringify(this.toObject())
    }

    getHash() {
        return Hash.sha256(this.toJson())
    }

    getInputs() {
        let input = [{
            value: giantConfig.owner.premine,
            prevTx: this.prevTxId,
            index: 0,
            scriptSig: ''
        }]

        return input
    }

    getOutputs() {
        let output = [{
            value: this.countOutput(),
            ScryptPubKey: ''
        }]

        return output
    }

    countOutput() {
        let deployFee = 0
        /*  this.db.getMetadata().then((metadata) => {
              const lastContracts = metadata.contracts[metadata.contracts.length - 1]

              for (let i in lastContracts) {
                  deployFee = lastContracts[i].deployFee
              }

              const chainOwner = giantConfig.owner

              const chainOwnerBalance = chainOwner.premine

              logger.warn(`Miner balance:  ${chainOwnerBalance} GIC`)

              logger.warn(`Miner deploy fee :  ${deployFee} GIC`)

              return deployFee
          })*/
    }


    scriptSig() {
        /**
         *  ru
         *  Поле scriptSig состоит из двух составляющих – публичный ключ и подпись.
         Хэш от указанного публичного ключа должен соответствовать хэшу получателя,
         указанному в предыдущей транзакции.
         Публичный ключ используется для проверки указанной в транзакции подписи.
         Подпись генерируется на основе хеша некоторых полей данной транзакции.
         Таким образом, открытый ключ в совокупности с подписью подтверждает,
         что транзакция была создана реальным валидным получателем, на которого ссылается предыдущая транзакция.
         Стоит отметить, что подпись никогда не пприменяется к транзакции целиком, и пользователи могут указывать,
         какая часть транзакции подписывается (конечно, кроме поля scriptSig).*/
        return
    }

    ScryptPubKey() {
        /**
         scriptPubKey:{
                "asm":"OP_RETURN 54f55fe6f2a0f349e2921d06e63d58712a906fbb4231f1e943da82d6",
                "hex":"6a1c54f55fe6f2a0f349e2921d06e63d58712a906fbb4231f1e943da82d6",
                "message":"unable to decode tx type!"
        }*/
        return
    }

    validate() {

        // TODO : validate
        return new Promise((resolve, reject) => {
            if (this.type === 'deploy') {
                const contract = new Contract(this.options)

                resolve(contract)
            } else if (this.type === 'call') {
                const result = null // Result of contract's method execution

                resolve(result)
            } else if (this.type === 'transfer') {
                /*sendCoin (receiver) {
                    const tx = getTransaction()
                    const sender = getCallerAddress()
                    const senderBalance = this.balances.get(sender)
                    if (senderBalance < tx.amount) {
                        return false
                    }

                    const receiverBalance = this.balances.get(receiver)
                    this.balances.set(sender, senderBalance - tx.amount)
                    this.balances.set(receiver, (receiverBalance ? receiverBalance : 0) + tx.amount)

                    return true
                }*/
                resolve(null)
            } else {
                resolve(null)
            }
        })
    }
}
