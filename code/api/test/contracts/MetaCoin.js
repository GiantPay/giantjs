'use strict'

import Contract from 'GiantContract'
import {getAddress, getCallerAddress, getTransaction} from 'GiantBlockchain'

/**
 * This is just a simple example of a coin-like contract.
 * It is not standards compatible and cannot be expected to talk to other
 * coin/token contracts.
 */
export default class MetaCoin extends Contract {

    constructor () {
        super()
        this.balances = new Map()
        this.owner = getCallerAddress()
    }

    buyCoin () {
        const buyer = getCallerAddress()
        const buyerBalance = this.balances.get(sender)
        const tx = getTransaction()

        this.balances.set(buyer, buyerBalance + tx.amount)

        return getCallerAddress()
    }

    sendCoin (receiver) {
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
    }

    getBalance (address) {
        return this.balances.get(address)
    }
}
