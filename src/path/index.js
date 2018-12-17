import fs from 'fs'
import path from 'path'
import mkdirs from 'mkdirp'
import logger from "../logger";

const touchPath = (fullPath) => {
    if (!fs.existsSync(fullPath)) {
        mkdirs(fullPath)
    }
    return fullPath
}

const cleanPath = (targetPath, root) => {
    let files
    try {
        files = fs.readdirSync(targetPath)
    } catch (e) {
        logger.error(e)
        return
    }
    if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
            const filePath = path.resolve(targetPath, files[i])
            if (fs.statSync(filePath).isFile()) {
                fs.unlinkSync(filePath)
            } else {
                cleanNetworkPath(filePath, false)
            }
        }
    }
    if (!root) {
        fs.rmdirSync(dirPath);
    }
}

// FIXME
const currentPath = process.cwd()
const contractPath = touchPath(path.resolve(currentPath, './contracts'))
const buildPath = touchPath(path.resolve(currentPath, '../build/contracts/'))
const networkPath = touchPath(path.resolve(currentPath, './networks'))

export default {
    getBuildPath: () => buildPath,
    getTargetContractFile: (name) => path.resolve(buildPath, `./${name}.js`),
    getTargetContractFileRunTime: (name) => path.resolve(buildPath, `./${name}RunTime.js`),
    getContractPath: () => contractPath,
    getContractFile: (name) => path.resolve(contractPath, `./${name}.js`),
    getNetworkPath: (name) => path.resolve(networkPath, `./${name}/`),
    // utils
    touchPath: touchPath,
    cleanPath: cleanPath
}
