export default class Transaction {

    constructor (options) {
        this.hash = 'asdasdklasdlk'
    }

    static sendFrom (from, to, amount) {

    }

    static deployContract (from, code) {
        const transaction = new Transaction({
            from: from,
            data: code,
            type: 'deploy'
        })

        return transaction
    }

    static callContract (from, contractAddress, method, args) {

    }

    validate () {
        return new Promise((resolve, reject) => {
            if (this.type === 'deploy') {
                // TODO deploy contract
                resolve(null)
            } else if (this.type === 'call') {
                // TODO call contract method
                resolve(null)
            } else {
                resolve(null)
            }
        })
    }
}
