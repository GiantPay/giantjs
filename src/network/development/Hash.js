import crypto from 'crypto'

const sha256 = (string) => {
    if(typeof string != 'string'){
        string = JSON.stringify(string)
    }
    return crypto.createHash('sha256')
        .update(string)
        .digest()
        .toString('hex')
}

const sha256sha256 = (string) => {
    return sha256(sha256(string))
}

export default {
    sha256: sha256,
    sha256sha256: sha256sha256
}
