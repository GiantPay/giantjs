'use strict'

import 'chai/register-should'
import Block from '../src/network/development/Block'
import Transaction from '../src/network/development/Transaction'

const prevHash = '9877a99887b89897009929888888f9fff98c99ab9888129099de8998810002c5'
const timestamp = new Date().getTime()
const transactions = [{}, {}]

describe('Block', () => {

    describe('@constructor', () => {

        it('throw error if constructor parameters is missed', () => {
            (() => {
                const block = new Block()
            }).should.throw('"options" is expected')
        })

        it('set the specified timestamp', () => {
            const block = new Block({prevHash: prevHash, timestamp: timestamp})
            block.timestamp.should.be.a('number')
            block.timestamp.should.be.equal(timestamp)
        })

        it('set the timestamp if not specified', () => {
            const block = new Block({prevHash: prevHash})
            block.timestamp.should.be.a('number')
            block.timestamp.should.be.above(0)
        })

        it('not throw error if prevHash is set to null', () => {
            const block = new Block({prevHash: null})
            should.exist(block)
        })

        it('throw error if missing prevHash', () => {
            (() => {
                const block = new Block({})
            }).should.throw('"prevHash" is expected')
        })

        it('throw error if data is not an array', function () {
            (() => {
                const block = new Block({prevHash: prevHash, data: 'not an array'})
            }).should.throw('"data" is expected to be an array')
        })

        it('data transformate from an array of objects to an array of transaction\'', () => {
            const block = new Block({prevHash: prevHash, data: transactions})
            block.data.should.be.an('array')
            block.data.should.be.lengthOf(2)
            block.data.forEach((tx) => {
                tx.should.be.instanceOf(Transaction)
            })
        })
    })

    describe('#validate', () => {
        // TODO
    })
})