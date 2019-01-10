import fs from 'fs'
import path from 'path'

const giantConfig = require(path.relative(__dirname, `${process.cwd()}/config.json`))

export default giantConfig
