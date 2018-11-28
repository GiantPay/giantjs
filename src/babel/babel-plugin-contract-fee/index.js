import logger from '../../logger'

/**
 * Literal
 ExpressionStatement
 Identifier
 MemberExpression
 Property
 ObjectExpression
 CallExpression
 VariableDeclarator
 VariableDeclaration
 BinaryExpression
 UpdateExpression
 LogicalExpression
 AssignmentExpression
 IfStatement
 BlockStatement
 ForStatement
 FunctionDeclaration
 ReturnStatement
 FunctionExpression
 ConditionalExpression
 UnaryExpression
 NewExpression
 ThrowStatement
 ThisExpression
 SequenceExpression
 ArrayExpression
 Program
 *
 */

let pfeVars = {
    literal: {count: 0, max: 1000, fee: 4, required: false},
    expressionStatement: {count: 0, max: 1000, fee: 4, required: false},
    identifier: {count: 0, max: 1000, fee: 4, required: false},
    property: {count: 0, max: 1000, fee: 4, required: false},
    objectExpression: {count: 0, max: 100, fee: 4, required: false},
    memberExpression: {count: 0, max: 100, fee: 4, required: false},
    callExpression: {count: 0, max: 100, fee: 4, required: false},
    variableDeclarator: {count: 0, max: 100, fee: 4, required: false},
    variableDeclaration: {count: 0, max: 100, fee: 4, required: false},
    binaryExpression: {count: 0, max: 100, fee: 4, required: false},
    updateExpression: {count: 0, max: 100, fee: 4, required: false},
    logicalExpression: {count: 0, max: 100, fee: 4, required: false},
    assignmentExpression: {count: 0, max: 100, fee: 4, required: false},
    blockStatement: {count: 0, max: 100, fee: 4, required: false},
    forStatement: {count: 0, max: 100, fee: 4, required: false},
    functionDeclaration: {count: 0, max: 100, fee: 4, required: true},
    returnStatement: {count: 0, max: 100, fee: 4, required: false},
    functionExpression: {count: 0, max: 100, fee: 4, required: false},
    conditionalExpression: {count: 0, max: 100, fee: 4, required: false},
    unaryExpression: {count: 0, max: 100, fee: 4, required: false},
    newExpression: {count: 0, max: 100, fee: 4, required: false},
    throwStatement: {count: 0, max: 100, fee: 4, required: false},
    thisExpression: {count: 0, max: 100, fee: 4, required: false},
    sequenceExpression: {count: 0, max: 100, fee: 4, required: false},
    arrayExpression: {count: 0, max: 100, fee: 4, required: false},
    program: {count: 0, max: 1, fee: 10, required: false},
}

/**
 * @returns ast and pfe functions of the giant contract code
 *
 */
export default ({template: template}) => {

    let pfeCall = (declaration, fee) => {
        return template(`pfe("` + declaration + `", ` + fee + `)`, {
            sourceType: 'module'
        })()
    }

    return {
        visitor: {
            Program: (path) => {
                /**
                 * pfe Program
                 *
                 *
                 logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.program.count)
                 path.insertAfter(pfeCall('Program', pfeVars.program.fee))
                 logger.warn('insert pfe : Program')
                 pfeVars.program.count++
                 */
                path.traverse({
                    FunctionDeclaration: (path) => {
                        /**
                         * pfe FunctionDeclaration
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.functionDeclaration.count)
                        path.insertBefore(pfeCall('FunctionDeclaration', pfeVars.functionDeclaration.fee))
                        logger.warn('insert pfe : FunctionDeclaration')
                        pfeVars.functionDeclaration.count++
                    }
                })
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
