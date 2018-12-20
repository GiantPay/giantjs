import GiantNode from '../network/GiantNode'
import GiantContract from '../compile/GiantContract'

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
        // print accounts info
        giantNode.getInfo()

        // print deployed contracts info
    })
}
