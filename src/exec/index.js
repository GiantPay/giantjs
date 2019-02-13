import GiantNode from '../network/GiantNode'
import GiantContract from '../compile/GiantContract'
import logger from "../logger";

export default (address, method, args) => {

    const options = {
        network: 'development',
        mining: false
    }
    const giantNode = new GiantNode(options)

    giantNode.on('ready', () => {
        // [tmp] get last contract address
        giantNode.getLastContract(contractAddress => {

            console.log('')
            logger.info('Contract Address', contractAddress)
            console.log('')

            giantNode.initContract(contractAddress, (metadata) => {
                logger.info(`Set pfe info for methods in metadata`)

                let contract = giantNode.contracts[metadata.className]

                contract.metadata = giantNode.whitePaperFee(metadata)

                logger.info(`Class ${metadata.className} metadata`)

                console.log(contract.metadata)

                /**
                 * Example call wp method getCallerBalance
                 * TODO : contract.initMethod({'name': 'getCallerBalance', 'args': {'a': 1, 'b': 1}})
                 */

                giantNode.initMethod({'contractName': metadata.className, 'method': method, 'args': args}) //args obj {'a': 1, 'b': 1}

                //logger.info(`WP getCallerBalance : ${contract.getCallerBalance()} GIC`)

                //Sending some amount GIC for each account
                const billAmount = 20
                const contractAddressArr = giantNode.getAccounts()
                const mockCaller = giantNode.getCaller()
                //console.log(contractAddressArr)

                giantNode.contracts[metadata.className].multiplePayment(mockCaller, contractAddressArr, billAmount, (result) => {
                    logger.info(`MultiplePayment status ${result.status}`)
                })
            })
        })
    })
}
