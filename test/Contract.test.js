'use strict'

import fs from 'fs'
import path from 'path'
import async from 'async'

//import 'babel/polyfill'
import {transformFileSync} from 'babel-core'
import ContractFee from "../dist/babel/babel-plugin-contract-fee";

import 'chai/register-should'
import Contract from '../src/network/development/Contract'

const metaCoinCode = fs.readFileSync(path.resolve(__dirname, './contracts/MetaCoin.js'), {
    encoding: 'utf8'
})

describe('Contract', () => {

    describe('@constructor', () => {

        it('throw error if constructor parameters is missed', () => {
            (() => {
                const contract = new Contract()
            }).should.throw('"options" is expected')
        })

        it('throw error if code parameter is missed', () => {
            (() => {
                const contract = new Contract({})
            }).should.throw('"code" is expected')
        })

        it('throw error if feePrice parameter is missed', () => {
            (() => {
                const contract = new Contract({
                    code: '\'some js code\''
                })
            }).should.throw('"feePrice" is expected')
        })

        it('analyze the code if contract is created', () => {
            const contract = new Contract({
                code: metaCoinCode,
                feePrice: 0.0000001
            })

            contract.className.should.be.equal('MetaCoin')
            contract.methods.should.be.an('array')
            contract.methods.should.be.lengthOf(4)
            contract.methods[0].name.should.be.equal('constructor')
            contract.methods[0].params.should.be.an('array')
            contract.methods[0].params.should.be.empty
            contract.methods[0].type.should.be.equal('constructor')
            contract.methods[1].name.should.be.equal('buyCoin')
            contract.methods[1].params.should.be.an('array')
            contract.methods[1].params.should.be.empty
            contract.methods[1].type.should.be.equal('method')
            contract.methods[2].name.should.be.equal('sendCoin')
            contract.methods[2].params.should.be.an('array')
            contract.methods[2].params.should.be.members(['receiver'])
            contract.methods[2].type.should.be.equal('method')
            contract.methods[3].name.should.be.equal('getBalance')
            contract.methods[3].params.should.be.an('array')
            contract.methods[3].params.should.be.members(['address'])
            contract.methods[3].type.should.be.equal('method')
        })
    })

    describe('#getConstructorFee', () => {

        it('analyze the contract code', () => {
            const constructorFee = new Contract({
                code: metaCoinCode,
                feePrice: 0.0000001
            }).getConstructorFee({
                loops: 10
            })

            should.exist(constructorFee)
        })
    })

    describe('#runTime', () => {

        it('Some contracts files exist', () => {
            fs.readdir('./build/contracts', function (err, flist) {
                if (err) console.log('Some contracts files error', err.message, err.stack)
                flist.should.not.be.null
            })
        })

        it('All contracts have RunTime version', () => {

            fs.readdir('./build/contracts', function (err, flist) {
                if (err) console.log('Some contracts files error', err.message, err.stack)
                const contractsRunTime = flist.filter(f => f.indexOf('RunTime.js') > -1)
                const contracts = flist.filter(f => f.indexOf('RunTime.js') == -1 && f.indexOf('.js') > -1)

                contracts.length.should.be.equal(contractsRunTime.length)

                let c = 0
                for (let i in contracts) {
                    let RunTimeName = contracts[i].slice(0, -3) + 'RunTime.js'
                    const found = flist.find(f => f == RunTimeName)
                    if (typeof found != 'undefined') {
                        c++
                    }
                }

                c.should.be.equal(contracts.length)
            })
        })

        it('Last readable contracts is equals by his RunTime versions', () => {

            let contractPath = './build/contracts/', contract, contractRunTime,
                contractData,
                contractRunTimeData,
                newContractRunTimeData,
                pfeDesc = '\nfunction pfe(declaration, fee){console.log(declaration, fee)}',
                getLatestFile = () => {
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
                }

            let latestContract = getLatestFile()

            if (latestContract.indexOf('RunTime.js') == -1) {
                contract = latestContract
                contractRunTime = latestContract.slice(0, -3) + 'RunTime.js'
            } else {
                contract = latestContract.slice(0, -10) + '.js'
                contractRunTime = latestContract
            }

            new Promise(function (resolve, reject) {
                contractRunTimeData = fs.readFileSync(contractPath + contractRunTime, 'utf8')
                resolve()
            }).then(() => {
                let {ast, code} = transformFileSync(contractPath + contract, {
                    'plugins': [ContractFee]
                })
                if (code) {
                    newContractRunTimeData = code + pfeDesc
                }
                contractRunTimeData.should.be.equal(newContractRunTimeData)
            })
        })
    })

    describe('#getMethodFee', () => {

    })
})