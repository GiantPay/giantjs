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

        giantContract.compile()

        // TODO it's necessary to take from the parameters
        const accounts = giantNode.getAccounts()

        giantNode.deployContract(accounts[0], giantContract.getCode())
            .then((contract) => {
                logger.info(contract)
            })
            .catch((err) => {
                logger.error(err)
            })
            .finally(() => {
                giantNode.stop()
            })
    })
}
