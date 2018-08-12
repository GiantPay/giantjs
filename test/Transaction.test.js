'use strict'

import 'chai/register-should'
import Transaction from '../src/network/development/Transaction'
import TransactionType from '../src/network/development/TransactionType'

describe('Transaction', () => {

    describe('@constructor', () => {

        it('not throw error if constructor parameters is missed', function () {
            const tx = new Transaction()
            should.exist(tx)
        })

        it('set the transfer type if not specified', () => {
            const tx = new Transaction()
            tx.type.should.be.a('string')
            tx.type.should.be.equal(TransactionType.TRANSFER)
        })

        it('initialize the inputs if not specified', () => {
            const tx = new Transaction()
            tx.inputs.should.be.an('array')
            tx.inputs.should.be.empty
        })

        it('initialize the outputs if not specified', () => {
            const tx = new Transaction()
            tx.outputs.should.be.an('array')
            tx.outputs.should.be.empty
        })
    })
})