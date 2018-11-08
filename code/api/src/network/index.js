import GiantNode from '../network/GiantNode'
import GiantContract from '../compile/GiantContract'
import logger from '../logger'

/**
 * For each or a particular network, we print the following:
 * 1) network info
 * 2) list of accounts
 * 3) list of deployed contracts
 *
 */
export default (name, cmd) => {
    const giantNode = new GiantNode({
        network: 'development',
        mining: false
    })

    giantNode.on('ready', () => {
        // print network info
        // const networkInfo = giantNode.getInfo()

        // print accounts info
        // print deployed contracts info


    })
}
