import logger from '../../logger'

/**
 *
 *
 Literal - RangeError: Maximum call stack size exceeded
 ExpressionStatement - RangeError: Maximum call stack size exceeded
 Identifier - RangeError: Maximum call stack size exceeded
 MemberExpression - RangeError: Maximum call stack size exceeded
 Property - insertBefore broke syntax
 ObjectExpression - RangeError: Maximum call stack size exceeded
 CallExpression - RangeError: Maximum call stack size exceeded
 VariableDeclarator - insertBefore broke syntax
 VariableDeclaration - insertBefore broke syntax
 BinaryExpression - RangeError: Maximum call stack size exceeded
 UpdateExpression - RangeError: Maximum call stack size exceeded
 LogicalExpression - RangeError: Maximum call stack size exceeded
 AssignmentExpression - RangeError: Maximum call stack size exceeded
 IfStatement           +
 BlockStatement - insertBefore broke syntax
 ForStatement - not found, was found here https://viswesh.github.io/astVisualizer/index.html
 FunctionDeclaration   +
 ReturnStatement  - not found, but exist
 FunctionExpression - RangeError: Maximum call stack size exceeded
 ConditionalExpression - RangeError: Maximum call stack size exceeded
 UnaryExpression - RangeError: Maximum call stack size exceeded
 NewExpression - RangeError: Maximum call stack size exceeded
 ThrowStatement - not found, was found here https://viswesh.github.io/astVisualizer/index.html
 ThisExpression - not found, was found here https://viswesh.github.io/astVisualizer/index.html
 SequenceExpression - RangeError: Maximum call stack size exceeded
 ArrayExpression - not found, was found here https://viswesh.github.io/astVisualizer/index.html
 Program
 *
 */

let pfeVars = {
    literal: {count: 0, max: 1000, fee: 4, required: false},
    expressionStatement: {count: 0, max: 1000, fee: 4, required: false},
    identifier: {count: 0, max: 1000, fee: 4, required: false},
    memberExpression: {count: 0, max: 100, fee: 4, required: false},
    property: {count: 0, max: 1000, fee: 4, required: false},
    objectExpression: {count: 0, max: 100, fee: 4, required: false},
    callExpression: {count: 0, max: 100, fee: 4, required: false},
    variableDeclarator: {count: 0, max: 100, fee: 4, required: false},
    variableDeclaration: {count: 0, max: 100, fee: 4, required: false},
    binaryExpression: {count: 0, max: 100, fee: 4, required: false},
    updateExpression: {count: 0, max: 100, fee: 4, required: false},
    logicalExpression: {count: 0, max: 100, fee: 4, required: false},
    assignmentExpression: {count: 0, max: 100, fee: 4, required: false},
    ifStatement: {count: 0, max: 100, fee: 4, required: false},
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
                    /**
                     * pfe StringLiteral
                     *
                     *  StringLiteral: (path) => {
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.literal.count)
                        path.insertBefore(pfeCall('StringLiteral', pfeVars.literal.fee))
                        logger.warn('insert pfe : StringLiteral')
                        pfeVars.literal.count++
                    },*/
                    FunctionDeclaration: (path) => {
                        /**
                         * pfe FunctionDeclaration
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.functionDeclaration.count)
                        path.insertBefore(pfeCall('FunctionDeclaration', pfeVars.functionDeclaration.fee))
                        logger.warn('insert pfe : FunctionDeclaration')
                        pfeVars.functionDeclaration.count++
                    },
                    Property: (path) => {
                        /**
                         * pfe Property
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.property.count)
                        /**
                         * path.insertBefore(pfeCall('Property', pfeVars.property.fee))
                         *
                         * broken syntax
                         *
                         * */
                        logger.warn('insert pfe : Property')
                        pfeVars.functionDeclaration.count++
                    },
                    /* ObjectExpression: (path) => {
                         /!**
                          * pfe ObjectExpression
                          *
                          * *!/
                         logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.objectExpression.count)
                         path.insertBefore(pfeCall('ObjectExpression', pfeVars.objectExpression.fee))
                         logger.warn('insert pfe : ObjectExpression')
                         pfeVars.objectExpression.count++

                     }, CallExpression: (path) => {
                         /!**
                          * pfe CallExpression
                          *
                          * *!/
                         logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.callExpression.count)
                         path.insertBefore(pfeCall('CallExpression', pfeVars.callExpression.fee))
                         logger.warn('insert pfe : CallExpression')
                         pfeVars.callExpression.count++

                     },*/
                    VariableDeclarator: (path) => {
                        /**
                         * pfe VariableDeclarator
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.variableDeclarator.count)
                        /**
                         * path.insertBefore(pfeCall('VariableDeclarator', pfeVars.variableDeclarator.fee))
                         *
                         * broken syntax
                         *
                         * */
                        logger.warn('insert pfe : VariableDeclarator')
                        pfeVars.variableDeclarator.count++
                    },
                    VariableDeclaration: (path) => {
                        /**
                         * pfe VariableDeclaration
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.variableDeclaration.count)
                        /**
                         * path.insertBefore(pfeCall('VariableDeclaration', pfeVars.callExpression.fee))
                         *
                         * broken syntax
                         *
                         * */
                        logger.warn('insert pfe : VariableDeclaration')
                        pfeVars.variableDeclaration.count++
                    },
                    /* BinaryExpression: (path) => {
                         /!**
                          * pfe BinaryExpression
                          *
                          * *!/
                         logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.binaryExpression.count)
                         path.insertBefore(pfeCall('BinaryExpression', pfeVars.binaryExpression.fee))
                         logger.warn('insert pfe : BinaryExpression')
                         pfeVars.binaryExpression.count++
                     },*/
                    /* UpdateExpression: (path) => {
                         /!**
                          * pfe UpdateExpression
                          *
                          * *!/
                         logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.updateExpression.count)
                         path.insertBefore(pfeCall('UpdateExpression', pfeVars.updateExpression.fee))
                         logger.warn('insert pfe : UpdateExpression')
                         pfeVars.updateExpression.count++
                     },*/
                    /*LogicalExpression: (path) => {
                        /!**
                         * pfe LogicalExpression
                         *
                         * *!/
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.logicalExpression.count)
                        path.insertBefore(pfeCall('LogicalExpression', pfeVars.logicalExpression.fee))
                        logger.warn('insert pfe : LogicalExpression')
                        pfeVars.logicalExpression.count++
                    },*/
                    /*AssignmentExpression: (path) => {
                        /!**
                         * pfe AssignmentExpression
                         *
                         * *!/
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.assignmentExpression.count)
                        path.insertBefore(pfeCall('AssignmentExpression', pfeVars.assignmentExpression.fee))
                        logger.warn('insert pfe : AssignmentExpression')
                        pfeVars.assignmentExpression.count++
                    },*/
                    IfStatement: (path) => {
                        /**
                         * pfe IfStatement
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.ifStatement.count)
                        path.insertBefore(pfeCall('IfStatement', pfeVars.ifStatement.fee))
                        logger.warn('insert pfe : IfStatement')
                        pfeVars.ifStatement.count++
                    },
                    BlockStatement: (path) => {
                        /**
                         * pfe BlockStatement
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.blockStatement.count)
                        /**
                         * path.insertBefore(pfeCall('BlockStatement', pfeVars.blockStatement.fee))
                         *
                         * broken syntax
                         *
                         * */
                        /*path.traverse({
                            StringLiteral: (subPath) => {
                                logger.debug('node type : ' + subPath.get('type').node + ' ' + pfeVars.literal.count)
                                subPath.insertBefore(pfeCall('StringLiteral', pfeVars.literal.fee))
                                logger.warn('insert pfe : StringLiteral')
                                pfeVars.literal.count++
                            }
                        })*/


                        logger.warn('insert pfe : BlockStatement')
                        pfeVars.blockStatement.count++
                    },
                    ForStatement: (path) => {
                        /**
                         * pfe ForStatement
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.forStatement.count)
                        path.insertBefore(pfeCall('ForStatement', pfeVars.forStatement.fee))
                        logger.warn('insert pfe : ForStatement')
                        pfeVars.forStatement.count++
                    },
                    ReturnStatement: (path) => {
                        /**
                         * pfe ReturnStatement
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.returnStatement.count)
                        path.insertBefore(pfeCall('ReturnStatement', pfeVars.returnStatement.fee))
                        logger.warn('insert pfe : ReturnStatement')
                        pfeVars.returnStatement.count++
                    },
                    /*FunctionExpression: (path) => {
                        /!**
                         * pfe FunctionExpression
                         *
                         * *!/
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.functionExpression.count)
                        path.insertBefore(pfeCall('FunctionExpression', pfeVars.functionExpression.fee))
                        logger.warn('insert pfe : FunctionExpression')
                        pfeVars.functionExpression.count++
                    },*/
                    /*ConditionalExpression: (path) => {
                        /!**
                         * pfe ConditionalExpression
                         *
                         * *!/
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.conditionalExpression.count)
                        path.insertBefore(pfeCall('ConditionalExpression', pfeVars.conditionalExpression.fee))
                        logger.warn('insert pfe : ConditionalExpression')
                        pfeVars.conditionalExpression.count++
                    },*/
                    /*UnaryExpression: (path) => {
                        /!**
                         * pfe UnaryExpression
                         *
                         * *!/
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.unaryExpression.count)
                        path.insertBefore(pfeCall('UnaryExpression', pfeVars.unaryExpression.fee))
                        logger.warn('insert pfe : UnaryExpression')
                        pfeVars.unaryExpression.count++
                    },*/
                    NewExpression: (path) => {
                        /**
                         * pfe NewExpression
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.newExpression.count)
                        path.insertBefore(pfeCall('NewExpression', pfeVars.newExpression.fee))
                        logger.warn('insert pfe : NewExpression')
                        pfeVars.newExpression.count++
                    },
                    ThrowStatement: (path) => {
                        /**
                         * pfe ThrowStatement
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.throwStatement.count)
                        path.insertBefore(pfeCall('ThrowStatement', pfeVars.throwStatement.fee))
                        logger.warn('insert pfe : ThrowStatement')
                        pfeVars.throwStatement.count++
                    },
                    ThisExpression: (path) => {
                        /**
                         * pfe ThisExpression
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.thisExpression.count)
                        path.insertBefore(pfeCall('ThisExpression', pfeVars.thisExpression.fee))
                        logger.warn('insert pfe : ThisExpression')
                        pfeVars.thisExpression.count++
                    },
                    /*SequenceExpression: (path) => {
                        /!**
                         * pfe SequenceExpression
                         *
                         * *!/
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.sequenceExpression.count)
                        path.insertBefore(pfeCall('SequenceExpression', pfeVars.sequenceExpression.fee))
                        logger.warn('insert pfe : SequenceExpression')
                        pfeVars.sequenceExpression.count++
                    },*/
                    ArrayExpression: (path) => {
                        /**
                         * pfe ArrayExpression
                         *
                         * */
                        logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.arrayExpression.count)
                        path.insertBefore(pfeCall('ArrayExpression', pfeVars.arrayExpression.fee))
                        logger.warn('insert pfe : ArrayExpression')
                        pfeVars.arrayExpression.count++
                    },
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
