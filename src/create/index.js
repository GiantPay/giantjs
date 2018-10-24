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
                fs.writeFile(
                    path.resolve(contracts, name + '.js'),
                    '\'use strict\'\n\n' +
                    'import Contract from \'GiantContract\'\n\n' +
                    'export default class ' + name + ' extends Contract {\n' +
                    '\tconstructor() {\n' +
                    '\t\tsuper()\n' +
                    '\t}\n' +
                    '}',
                    function (err) {
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