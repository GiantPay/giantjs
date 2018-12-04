import logger from '../../logger'

let pfeVars = {
    StringLiteral: {count: 0, max: 1000, fee: 4, required: true},
    ExpressionStatement: {count: 0, max: 1000, fee: 4, required: true},
    Identifier: {count: 0, max: 1000, fee: 4, required: true},
    MemberExpression: {count: 0, max: 100, fee: 4, required: true},
    ObjectProperty: {count: 0, max: 1000, fee: 4, required: true},
    ObjectExpression: {count: 0, max: 100, fee: 4, required: true},
    CallExpression: {count: 0, max: 100, fee: 4, required: true},
    VariableDeclarator: {count: 0, max: 100, fee: 4, required: true},
    VariableDeclaration: {count: 0, max: 100, fee: 4, required: true},
    BinaryExpression: {count: 0, max: 100, fee: 4, required: true},
    UpdateExpression: {count: 0, max: 100, fee: 4, required: true},
    LogicalExpression: {count: 0, max: 100, fee: 4, required: true},
    AssignmentExpression: {count: 0, max: 100, fee: 4, required: true},
    IfStatement: {count: 0, max: 100, fee: 4, required: true},
    BlockStatement: {count: 0, max: 100, fee: 4, required: true},
    ForStatement: {count: 0, max: 100, fee: 4, required: true},
    FunctionDeclaration: {count: 0, max: 100, fee: 4, required: true},
    ReturnStatement: {count: 0, max: 100, fee: 4, required: true},
    FunctionExpression: {count: 0, max: 100, fee: 4, required: true},
    ConditionalExpression: {count: 0, max: 100, fee: 4, required: true},
    UnaryExpression: {count: 0, max: 100, fee: 4, required: true},
    NewExpression: {count: 0, max: 100, fee: 4, required: true},
    ThrowStatement: {count: 0, max: 100, fee: 4, required: true},
    ThisExpression: {count: 0, max: 100, fee: 4, required: true},
    SequenceExpression: {count: 0, max: 100, fee: 4, required: false},
    ArrayExpression: {count: 0, max: 100, fee: 4, required: true},
    Program: {count: 0, max: 1, fee: 10, required: true},
}, pfeVarsCount = (type) => {
    pfeVars.hasOwnProperty(type) ? pfeVars[type].count++ : pfeVars[type] = {count: 1}
}


/**
 * @returns ast and pfe functions of the giant contract code
 *
 */
export default ({template: template}) => {
    let pfeCall = (pfeVars) => {
        let str = '{'
        for (let i in pfeVars) {
            str += i + ': {count: ' + pfeVars[i]['count'] + ', fee: ' + pfeVars[i]['fee'] + '},\n'
        }
        str += '}'
        return template(`var pfeVars = ${str}`, {
            sourceType: 'module'
        })()
    }, injectionPath

    return {
        visitor: {
            Program: (path) => {
                pfeVarsCount(path.type)
                path.traverse({
                    StringLiteral: (path) => {
                        /**
                         *  its possible use like White Paper marker
                         *
                         *  logger.info("Visiting StringLiteral : " + path.node.value)
                         *
                         {giantjs} info  : Visiting StringLiteral : buyCoin
                         {giantjs} info  : Visiting StringLiteral : sendCoin
                         {giantjs} info  : Visiting StringLiteral : getBalance
                         *
                         */
                        pfeVarsCount(path.type)
                    },
                    ExpressionStatement: (path) => {
                        pfeVarsCount(path.type)
                    },
                    FunctionDeclaration: (path) => {
                        pfeVarsCount(path.type)
                        if (path.node.id.name == '_inherits') {
                            /**
                             *  Some place for injection pfeVars
                             */
                            injectionPath = path
                        }
                    },
                    Identifier: (path) => {
                        pfeVarsCount(path.type)
                        /**
                         *  its possible use like White Paper marker
                         *
                         *  logger.info("Visiting Identifier : " + path.node.name)
                         *
                         {giantjs} info  : Visiting Identifier : getBalance
                         {giantjs} info  : Visiting Identifier : address
                         {giantjs} info  : Visiting Identifier : balances
                         {giantjs} info  : Visiting Identifier : get
                         {giantjs} info  : Visiting Identifier : address
                         {giantjs} info  : Visiting Identifier : MetaCoin
                         *
                         */
                        logger.info("Visiting Identifier : " + path.node.name)
                    },
                    MemberExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    ObjectProperty: (path) => {
                        pfeVarsCount(path.type)
                    },
                    ObjectExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    CallExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    VariableDeclarator: (path) => {
                        pfeVarsCount(path.type)
                    },
                    VariableDeclaration: (path) => {
                        pfeVarsCount(path.type)
                    },
                    BinaryExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    UpdateExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    LogicalExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    AssignmentExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    IfStatement: (path) => {
                        pfeVarsCount(path.type)
                    },
                    BlockStatement: (path) => {
                        pfeVarsCount(path.type)
                    },
                    ForStatement: (path) => {
                        pfeVarsCount(path.type)
                    },
                    ReturnStatement: (path) => {
                        pfeVarsCount(path.type)
                    },
                    FunctionExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    ConditionalExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    UnaryExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    NewExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    ThrowStatement: (path) => {
                        pfeVarsCount(path.type)
                    },
                    ThisExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    SequenceExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                    ArrayExpression: (path) => {
                        pfeVarsCount(path.type)
                    },
                })
                injectionPath.insertAfter(pfeCall(pfeVars))
            }
        }, post(state) {

            /**
             * validator logic
             *
             * */
            let foundErrors = []
            for (let k in pfeVars) {
                if (pfeVars[k].required && !pfeVars[k].count) {
                    foundErrors.push('not found ' + k)
                }
                if (pfeVars[k].count > pfeVars[k].max) {
                    foundErrors.push(k + ' ' +
                        pfeVars[k].count +
                        ' times payment, expect max ' +
                        pfeVars[k].max)
                } else {
                    logger.info('found ' + k + ' ' + pfeVars[k].count + ' times payment')
                }
            }

            if (!foundErrors.length) {
                logger.warn('Succeseful! Contract ' + state.opts.basename + ' code and pfe transpiled.')
            } else {
                logger.error('Some errors found', foundErrors)
            }

        }
    }
}
