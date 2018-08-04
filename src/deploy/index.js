import GiantNode from '../network/GiantNode'
import GiantContract from '../compile/GiantContract'

export default (name) => {
    const giantNode = new GiantNode({
        network: 'development'
    })

    giantNode.on('ready', () => {
        const giantContract = new GiantContract(name)

        giantContract.compile()

        // TODO it's necessary to take from the parameters
        const accounts = giantNode.getAccounts()

        giantNode.deployContract(accounts[0], giantContract.getCode())
            .then((contract) => {
                console.log(contract)
            })
            .catch((err) => {
                console.log(err)
            })
    })
}
