import logger from '../../logger'
import giantConfig from "../../config";

let pfeVars = {
    Program: {count: 0, max: 1, fee: 10, required: true},
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
    ForStatement: {count: 0, max: 10, fee: 20, required: false},
    ForInStatement: {count: 0, max: 10, fee: 20, required: false},
    WhileStatement: {count: 0, max: 10, fee: 20, required: false},
    DoWhileStatement: {count: 0, max: 10, fee: 20, required: false},
    WhitePaper: {
        getNodeOwner: {count: 0, max: 10, fee: 20, required: false},
        getNodeOwnerBalance: {count: 0, max: 10, fee: 20, required: false},
        getCaller: {count: 0, max: 10, fee: 20, required: false},
        getCallerBalance: {count: 0, max: 10, fee: 20, required: false},
    },
}, pfeVarsCount = (type, whitePaper) => {
    if (type) {
        pfeVars.hasOwnProperty(type) ? pfeVars[type].count++ : pfeVars[type] = {count: 1}
    } else if (whitePaper) {
        pfeVars.WhitePaper[whitePaper].count++
    }
}


/**
 * @returns ast and pfe functions of the giant contract code
 *
 */
export default ({template: template}) => {
    let pfeCall = (pfeVars) => {
        let str = '{'
        for (let i in pfeVars) {
            str += i + `: {count: ${pfeVars[i]['count']}, fee: ${pfeVars[i]['fee']}},\n`
        }
        for (let i in pfeVars.WhitePaper) {
            str += i + `: {count: ${pfeVars.WhitePaper[i]['count']}, fee: ${pfeVars.WhitePaper[i]['fee']}},\n`
        }
        str += '}'
        return template(`var pfeVars = ${str}`, {
            sourceType: 'module'
        })()
    }, injectionPath

    return {
        visitor: {
            Program: (path) => {
                pfeVarsCount(path.type, false)
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
                        pfeVarsCount(path.type, false)
                        if (pfeVars.WhitePaper.hasOwnProperty(path.node.value)) {
                            pfeVarsCount(false, path.node.value)
                        }
                    },
                    ExpressionStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    FunctionDeclaration: (path) => {
                        pfeVarsCount(path.type, false)
                        if (path.node.id.name == '_inherits') {
                            /**
                             *  Some place for injection pfeVars
                             */
                            injectionPath = path
                        }
                    },
                    Identifier: (path) => {
                        pfeVarsCount(path.type, false)
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
                    },
                    MemberExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ObjectProperty: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ObjectExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    CallExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    VariableDeclarator: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    VariableDeclaration: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    BinaryExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    UpdateExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    LogicalExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    AssignmentExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    IfStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    BlockStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ForStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ReturnStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    FunctionExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ConditionalExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    UnaryExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    NewExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ThrowStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ThisExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    SequenceExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ArrayExpression: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ForStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    ForInStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    WhileStatement: (path) => {
                        pfeVarsCount(path.type, false)
                    },
                    DoWhileStatement: (path) => {
                        pfeVarsCount(path.type, false)
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
            logger.warn(`Count fee debug ${giantConfig.debug}`)
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
                    if (giantConfig.debug) {
                        logger.info(k + ' ' + pfeVars[k].count + ' times payment')
                    }
                }
            }

            if (!foundErrors.length) {
                logger.warn('Succeseful! Contract code transpiled.')
            } else {
                logger.error('Some errors found', foundErrors)
            }

        }
    }
}
