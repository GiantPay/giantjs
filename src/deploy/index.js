import giantConfig from '../config'
import GiantNode from '../network/GiantNode'
import GiantContract from '../compile/GiantContract'
import logger from '../logger'
import Hash from "../network/development/Hash";

export default (name, cmd) => {
    const giantNode = new GiantNode({
        network: giantConfig.network,
        clean: cmd.clean,
        mining: giantConfig.mining
    })

    giantNode.on('ready', () => {
        const giantContract = new GiantContract(name)
        giantContract.validate()
        if (giantContract.valid) {
            try {
                logger.debug('Compile Contract')
                giantContract.compile()
            }
            catch (error) {
                logger.error('Contract compilation error')

                if (error instanceof TypeError) {
                    logger.warn('TypeError')
                }
                else if (error instanceof RangeError) {
                    logger.warn('RangeError, loops')
                }
                console.error(error);
            }
        }

        const accounts = giantNode.getAccounts()

        giantNode.getLastHashes((prevBlockHash, prevTxId) => {
            let options = {}

            const contractAddress = '0x' + Hash.sha256(prevBlockHash + giantContract.code)

            options.metadata = giantContract.getMetadata()

            options.metadata.contractAddress = options.contractAddress = contractAddress

            options.contractCode = giantContract.code

            options.contractName = giantContract.name

            options.prevBlockHash = prevBlockHash

            options.prevTxId = prevTxId

            options.metadata.deployFee = giantContract.pfeAmount

            logger.info(`Amount  :  ${options.metadata.deployFee} GIC \n`)

            options.from = accounts[0]

            giantNode.deployContract(options)

                .then((contract) => {
                    logger.info(`Your account :  ${accounts[0]}`)
                    logger.info(`Your balance  :  ${giantNode.getBalance()} GIC`)
                    logger.info(`Your contract  :  ${giantContract.name} was deployed`)
                })
                .catch((err) => {
                    logger.error(err)
                })
                .finally(() => {
                    setTimeout(() => {
                        giantNode.stop()
                    }, 2000)
                })
        })
    })
}
