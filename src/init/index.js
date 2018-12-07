import path from 'path'
import fs from 'fs'

export default () => {
    const currentDir = process.cwd()

    // TODO must be executed in an empty folder

    const contracts = path.resolve(currentDir, './contracts')

    fs.stat(contracts, (err, stats) => {
        if (err) {
            fs.mkdir(contracts, function (err) {
                //  console.log(err)
            })
        }
    })

    const migrations = path.resolve(currentDir, './migrations')
    fs.stat(migrations, (err, stats) => {
        if (err) {
            fs.mkdir(migrations, function (err) {
                //  console.log(err)
            })
        }
    })

    const networks = path.resolve(currentDir, './network')
    fs.stat(networks, (err, stats) => {
        if (err) {
            fs.mkdir(networks, function (err) {
                // console.log(err)
            })
        }
    })

    const test = path.resolve(currentDir, './test')
    fs.stat(test, (err, stats) => {
        if (err) {
            fs.mkdir(test, function (err) {
                console.log(err)
            })
        }
    })

    const config = path.resolve(currentDir, './giant.js')
    fs.writeFile(config, 'module.exports = {}', function (err) {
        if (err) {
            // console.log(err);
        }
    })

    console.log('folders ./contracts ./migrations ./network ./test and config ./giant.js created')
}