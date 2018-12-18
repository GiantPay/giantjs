import GiantNode from '../network/GiantNode'
import GiantContract from '../compile/GiantContract'
import logger from '../logger'


export default (name, cmd) => {
    const giantNode = new GiantNode({
        network: 'development',
        clean: cmd.clean,
        mining: true
    })

    giantNode.on('ready', () => {
        const giantContract = new GiantContract(name)
        giantContract.validate()
        if (giantContract.valid) {
            try {
                logger.debug('Compile')
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

        // TODO it's necessary to take from the parameters
        const accounts = giantNode.getAccounts()

        giantNode.deployContract(accounts[0], giantContract.getCode())
            .then((contract) => {
                logger.info('Your account : ' + accounts[0])
                logger.info('Your balance : ' + giantNode.getBalance() + ' GIC')
                logger.info('Your contract ' + giantContract.name + ' was deployed')
            })
            .catch((err) => {
                logger.error(err)
            })
            .finally(() => {
                setTimeout(() => {
                    giantNode.stop()
                }, 200)
            })
    })
}
