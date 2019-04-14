import path from 'path'
import fs from 'fs'
import figlet from 'figlet'
import logger from "../logger"

export default () => {
    const currentDir = process.cwd()

    // TODO must be executed in an empty folder

    const contracts = path.resolve(currentDir, './contracts')

    fs.stat(contracts, (err, stats) => {
        if (err) {
            fs.mkdir(contracts, function (error) {
                if (!error) {
                    console.log('new folder ./contracts')
                } else {
                    console.log(error)
                }
            })
        } else {
            console.log('found folder ./contracts')
        }
    })

    const migrations = path.resolve(currentDir, './migrations')
    fs.stat(migrations, (err, stats) => {
        if (err) {
            fs.mkdir(migrations, function (error) {
                if (!error) {
                    console.log('new folder ./migrations')
                } else {
                    console.log(error)
                }
            })
        } else {
            console.log('found folder ./migrations')
        }
    })

    const networks = path.resolve(currentDir, './network')
    fs.stat(networks, (err, stats) => {
        if (err) {
            fs.mkdir(networks, function (error) {
                if (!error) {
                    console.log('new folder ./network')
                } else {
                    console.log(error)
                }
            })
        } else {
            console.log('found folder ./network')
        }
    })

    const test = path.resolve(currentDir, './test')
    fs.stat(test, (err, stats) => {
        if (err) {
            fs.mkdir(test, function (error) {
                if (!error) {
                    console.log('new folder ./test')
                } else {
                    console.log(error)
                }
            })
        } else {
            console.log('found folder ./test')
        }
    })

    const config = path.resolve(currentDir, './giant.js')
    fs.writeFile(config, 'module.exports = {}', function (err) {
        if (err) {
            console.log(err)
        } else {
            figlet('Project is ready', function (error, data) {
                if (error) {
                    logger.error('Something went wrong...')
                    console.dir(error)
                    return
                }
                console.log(data)
                console.log('Success! Created folders ./contracts ./migrations ./network ./test and config ./giant.js')
            })
        }
    })
}