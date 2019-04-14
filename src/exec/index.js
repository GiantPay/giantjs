import GiantNode from '../network/GiantNode'
import GiantContract from '../compile/GiantContract'
import logger from "../logger";
import MockClient from '../network/development/MockClient'

export default (address, method, args) => {

    const options = {
        network: 'development',
        mining: false
    }
    const giantNode = new GiantNode(options)

    giantNode.on('ready', () => {
        giantNode.checkContractAddress(address, contractAddress => {
            if (contractAddress) {
                //applly methods call self.db.validateBlockData
                giantNode.getLastHashes((prevBlockHash, prevTxId) => {
                    giantNode.initContract(contractAddress, metadata => {
                        logger.info(`Set pfe info for methods in metadata`)

                        if (typeof giantNode.contracts[metadata.className] != 'undefined') {

                            let contract = giantNode.contracts[metadata.className]

                            contract.metadata = giantNode.whitePaperFee(metadata)

                            logger.info(`Class ${metadata.className} metadata`)

                            console.log(contract.metadata)

                            const options = {
                                'contractAddress': contractAddress,
                                'contractName': metadata.className,
                                'method': method,
                                'args': args,
                                'prevBlockHash': prevBlockHash,
                                'prevTxId': prevTxId
                            }

                            giantNode.initMethod(options) //args obj {'a': 1, 'b': 1}
                            /*const billAmount = 20
                            const contractAddressArr = giantNode.getAccounts()
                            const mockCaller = giantNode.getCaller()
                            //console.log(contractAddressArr)

                            giantNode.contracts[metadata.className].multiplePayment(mockCaller, contractAddressArr, billAmount, (result) => {
                                logger.info(`MultiplePayment status ${result.status}`)
                            })*/
                        } else {
                            logger.info(`Contract ${contractAddress} not found`)
                        }
                    })
                })
            }
        })
    })
}
