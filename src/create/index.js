import path from 'path'
import fs from 'fs'
import logger from '../logger'

const createContract = (name) => {
    const currentDir = process.cwd()

    const contracts = path.resolve(currentDir, './contracts')
    fs.stat(contracts, (err, stats) => {
        if (err) {
            fs.mkdir(contracts)
        }

        fs.stat(contracts, (err, stats) => {
            if (!err) {
                name = name.charAt(0).toUpperCase() + name.slice(1);
                fs.writeFile(
                    path.resolve(contracts, name + '.js'),
                    '\'use strict\'\n\n' +
                    'import Contract from \'../../dist/compile/GiantContract\'\n\n' +
                    'export default class ' + name + ' extends Contract {\n' +
                    '\tconstructor() {\n' +
                    '\t\tsuper()\n' +
                    '\t\tthis.balances = []\n' +
                    '\t}\n' +
                    '\n' +
                    '\tgetNodeOwner() {\n' +
                    '\t\tthis.owner = this.getOwnerAddress()\n' +
                    '\t\treturn this.owner\n' +
                    '\t}\n' +
                    '\n' +
                    '\tgetNodeOwnerBalance() {\n' +
                    '\t\tthis.ownerBalance = this.getOwnerPremine()\n' +
                    '\t\treturn this.ownerBalance\n' +
                    '\t}\n' +
                    '\n' +
                    '\tgetCaller() {\n' +
                    '\t\tthis.caller = this.getCallerAddress()\n' +
                    '\t\treturn this.caller\n' +
                    '\t}\n' +
                    '\n' +
                    '\tgetCallerBalance() {\n' +
                    '\t\tthis.callerBalance = this.getCallerPremine()\n' +
                    '\t\treturn this.callerBalance\n' +
                    '\t}\n' +
                    '\n' +
                    '\tgetPfe() {\n' +
                    '\t\treturn pfeVars\n' +
                    '\t}\n' +
                    '}',
                    (err) => {
                        if (err) {
                            return console.log(err);
                        }
                        logger.info('The contract ' + name + ' was created!')
                    }
                )
            }
        })
    })
}

const createMigration = (name) => {
    // TODO
}

const createTest = (name) => {
    // TODO
}

export default function (type, name) {
    switch (type) {
        case 'contract':
            createContract(name)
            break
        case 'migration':
            createMigration(name)
            break
        case 'test':
            createTest(name)
            break
    }

}