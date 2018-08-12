import colors from 'colors/safe'

const log = (...args) => {
    if (process.env.NODE_ENV === 'test') {
        return
    }

    const color = args.shift()
    const prefix = colors[color].bold(`{giantjs} ${args.shift()} :`)
    args[0] = `${prefix} ${args[0]}`
    console.log.apply(console, args)
}

export default {
    info: function () {
        log('blue', 'info ', ...arguments)
    },
    warn: function () {
        log('yellow', 'warn ', ...arguments)
    },
    debug: function () {
        log('magenta', 'debug', ...arguments)
    },
    error: function () {
        log('red', 'error', ...arguments)
    }
}
