import fs from 'fs'
import path from 'path'
import mkdirs from 'mkdirp'

const currentPath = process.cwd()
const contractPath = path.resolve(currentPath, './contracts')
const buildPath = path.resolve(currentPath, './build/contracts/')
const networkPath = path.resolve(currentPath, './networks')

if (!fs.existsSync(contractPath)) {
    mkdirs(contractPath)
}

if (!fs.existsSync(buildPath)) {
    mkdirs(buildPath)
}

if (!fs.existsSync(networkPath)) {
    mkdirs(networkPath)
}

export default {
    getBuildPath: () => buildPath,
    getTargetContractFile: (name) => path.resolve(buildPath, `./${name}.js`),
    getContractPath: () => contractPath,
    getContractFile: (name) => path.resolve(contractPath, `./${name}.js`),
    getNetworkPath: (name) => path.resolve(networkPath, `./${name}/`)
}
