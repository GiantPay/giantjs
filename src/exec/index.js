import GiantNode from '../network/GiantNode'
import GiantContract from '../compile/GiantContract'
import logger from "../logger";

export default (name, cmd) => {

    const options = {
        network: 'development',
        mining: false
    }
    const giantNode = new GiantNode(options)

    giantNode.on('ready', () => {
        giantNode.getLastContract(contractAddress => {
            console.log('')
            logger.info('Contract Address', contractAddress)
            console.log('')
            giantNode.initContract(contractAddress, (metadata) => {
                logger.info(`Set pfe info for methods in metadata`)

                giantNode.contracts[metadata.className].metadata = giantNode.WPFee(metadata)
                logger.info(`Class ${metadata.className} metadata`)
                console.log(giantNode.contracts[metadata.className].metadata)

                /**
                 * Example call wp method getCallerBalance
                 * TODO : giantNode.initMethod({'name': 'getCallerBalance', 'param1': true})
                 */

                logger.info(`WP getCallerBalance : ${giantNode.contracts[metadata.className].getCallerBalance()} GIC`)

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
