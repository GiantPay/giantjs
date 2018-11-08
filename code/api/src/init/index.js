import path from 'path'
import fs from 'fs'

export default () => {
    const currentDir = process.cwd()

    // TODO must be executed in an empty folder

    const contracts = path.resolve(currentDir, './contracts')
    fs.stat(contracts, (err, stats) => {
        if (err) {
            fs.mkdir(contracts)
        }
    })

    const migrations = path.resolve(currentDir, './migrations')
    fs.stat(migrations, (err, stats) => {
        if (err) {
            fs.mkdir(migrations)
        }
    })

    const networks = path.resolve(currentDir, './network')
    fs.stat(networks, (err, stats) => {
        if (err) {
            fs.mkdir(networks)
        }
    })

    const test = path.resolve(currentDir, './test')
    fs.stat(test, (err, stats) => {
        if (err) {
            fs.mkdir(test)
        }
    })

    const config = path.resolve(currentDir, './giant.js')
    fs.writeFile(config, 'module.exports = {}')
}