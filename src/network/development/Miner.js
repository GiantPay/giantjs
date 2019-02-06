import giantConfig from '../../config'
import Block from './Block'
import Wallet from './Wallet'
import logger from '../../logger'

import async from 'async'

export default class Miner {

    constructor(options) {
        const self = this

        this.db = options.db
        this.chain = options.chain
        this.memPool = options.memPool
        this.wallet = options.wallet
        this.started = false
        this.blockTime = options.blockTime || giantConfig.blockTime

        this.chain.on('genesis', () => {
            self.wallet.premine()
        })
    }

    start() {
        logger.info('Started miner')
        this.started = true
        this.mineBlocks()
    }

    stop() {
        logger.info('Stopped miner')
        this.started = false
    }

    mineBlocks() {
        const self = this

        async.whilst(
            () => self.started,
            (callback) => {
                self.mineBlock(function () {
                    setTimeout(callback, self.blockTime)
                })
            },
            (err) => {
                if (err) {
                    logger.error(err)
                }
            }
        )
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

    getPrevTx() {
        //if first tx - return null
        return
    }

    countOutput() {
        // plus Pfe (syntax + wp + sys)
        // deploy - get Fee from options
        // TODO : deploy get Fee from options
        // call - from vm

        // get Metadata from babel code reflection
        return 200
    }

    txStructure(cb) {

        let walletOwner = this.wallet.accounts[0]
        let chainOwner = this.wallet.accounts[1]
        let receipient = this.wallet.accounts[2] // mb get rand num between accounts[2] and accounts.length

        let input = {
            value: walletOwner.premine,
            prevTx: this.getPrevTx(),
            index: 0,
            scriptSig: ''
        }

        let output = {
            value: this.countOutput(),
            ScryptPubKey: ''
        }

        console.log(input.value)
        cb()

        /*


Transaction verification
In order to verify if the inputs are permitted to collect the requisite sums from the outputs of the preceding transactions,
Bitcoin uses the standard system of the script (see below) of scriptSig input and scriptPubKey output which this transaction references.
They are evaluated with the help of scriptPubKey using the remaining values in the scriptSig stack.

The input is confirmed if the scriptPubKey script returns a “true” value.
Using the script system, the sender can create very complex conditions to fulfill by those who wish to obtain the output value.
For example, it is possible to create an input which any user will obtain without authorization.
It is equally possible to request that the input be signed by 10 different keys or verified by password.




   Input

   An input is a reference to an output from a previous transaction.
   Multiple inputs are often listed in a transaction.
   All of the new transaction's input values (that is, the total coin value of the previous outputs referenced by the new transaction's inputs)
   are added up, and the total (less any transaction fee) is completely used by the outputs of the new transaction.
   Previous tx is a hash of a previous transaction.
   Index is the specific output in the referenced transaction.
   ScriptSig is the first half of a script (discussed in more detail later).

   The script contains two components, a signature and a public key. The public key must match the hash given in the script of the redeemed output.
   The public key is used to verify the redeemers signature, which is the second component. More precisely, the second component is an ECDSA signature
   over a hash of a simplified version of the transaction.
   It, combined with the public key, proves the transaction was created by the real owner of the bitcoins in question.
   Various flags define how the transaction is simplified and can be used to create different types of payment.

   Output

   An output contains instructions for sending bitcoins.
   Value is the number of Satoshi (1 BTC = 100,000,000 Satoshi) that this output will be worth when claimed.
   ScriptPubKey is the second half of a script (discussed later). There can be more than one output,
   and they share the combined value of the inputs. Because each output from one transaction can only ever be referenced
   once by an input of a subsequent transaction, the entire combined input value needs to be sent in an output
   if you don't want to lose it. If the input is worth 50 BTC but you only want to send 25 BTC,
   Bitcoin will create two outputs worth 25 BTC: one to the destination, and one back to you (known as "change", though you send it to yourself).
   Any input bitcoins not redeemed in an output is considered a transaction fee; whoever generates the block can claim it by inserting it into the coinbase transaction of that block.

           */
    }

    mineBlock(callback) {
        const self = this
        const memPoolTransactions = self.memPool.getTransactions()

        if (memPoolTransactions.length) {
            let transactions = []
            transactions = transactions.concat(memPoolTransactions)
            const block = new Block({
                prevHash: self.chain.tip.hash
            })

            self.txStructure(() => {
                self.db.addTransactionsToBlock(block, transactions)

                logger.debug(`Builder built block ${block.hash}`)

                self.chain.addBlock(block, (err) => {
                    if (err) {
                        self.chain.emit('error', err)
                    } else {
                        logger.debug(`Builder successfully added block ${block.hash} to chain`)
                    }
                    callback()
                })
            })

        } else {
            callback()
            logger.debug('miner: transaction doesn\'t found')
        }
    }
}
