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

    const options = {
        network: 'development',
        mining: false
    }
    const giantNode = new GiantNode(options)

    giantNode.on('ready', () => {
        let contractAddress = '0xef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
        //TODO: parse contractAddress from console command
        const contracts = giantNode.getAllContracts((contracts) => {
            if(!contracts.length) {
                console.log("Contracts not found")
                return
            }
            for (let i in contracts) {
                for (let c in contracts[i]) {
                    contractAddress = c
                }
            }
            console.log('')
            console.log('Contract Address', contractAddress)
            console.log('')

            //TODO: control for running contractss
            giantNode.initContract(contractAddress)
        })
    })
}
