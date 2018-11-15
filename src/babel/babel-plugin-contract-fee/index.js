import logger from '../../logger'

let found_errors = []

let found_ExportDefaultDeclaration = 0
let foundMax_ExportDefaultDeclaration = 1

let found_ClassDeclaration = 0
let foundMax_ClassDeclaration = 1

let found_ConstructorDeclaration = 0
let foundMax_ConstructorDeclaration = 1

let found_SuperDeclaration = 0
let foundMax_SuperDeclaration = 1

let found_FunctionDeclaration = 0
let foundMax_FunctionDeclaration = 100


/**
 * @returns ast and pfe functions of the giant contract code
 */
export default ({types: t, template: template}) => {


    var pfeCall = (declaration, fee) => {
        return template(`pfe("` + declaration + `", ` + fee + `)`, {
            sourceType: 'module'
        })()
    }

    return {
        visitor: {
            Program: (path) => {
                path.traverse({
                    ExportDefaultDeclaration: (subPath) => {

                        logger.debug('node type : ' + subPath.get('type').node)

                        /**
                         * pfe ExportDefaultDeclaration
                         *
                         * */
                        subPath.insertBefore(pfeCall('ExportDefaultDeclaration', 4));
                        logger.warn('insert pfe : ExportDefaultDeclaration')
                        found_ExportDefaultDeclaration++
                        subPath.stop()
                    }
                })
            },
            ClassDeclaration: (path) => {

                logger.debug('node type : ' + path.get('type').node)
                path.insertBefore(pfeCall('ClassDeclaration', 3));
                logger.warn('insert pfe : ClassDeclaration')
                found_ClassDeclaration++

                path.traverse({
                    ClassMethod(subPath) {
                        /**
                         * pfe ClassMethod
                         *
                         * */
                        let node = subPath.get('kind').node
                        if (node == 'constructor') {
                            /**
                             * pfe Constructor
                             *
                             * */
                            logger.debug('node type : ' + node)
                            subPath.insertBefore(pfeCall('Constructor', 10));
                            logger.warn('insert pfe : Constructor')
                            found_ConstructorDeclaration++

                            subPath.traverse({
                                CallExpression(subSubPath) {
                                    logger.debug('node type callee : ' + subSubPath.get('callee').get('type').node)
                                    path.insertBefore(pfeCall('Super', 10))
                                    logger.warn('insert pfe : Super')
                                    found_SuperDeclaration++
                                }
                            })
                        }
                        logger.debug('node type : ClassMethod kind ' + node)
                        path.insertBefore(pfeCall('ClassMethod', 5));
                        logger.warn('insert pfe : ClassMethod')

                        subPath.stop()
                    }
                })
            },

            FunctionDeclaration: (path) => {
                /**
                 * pfe FunctionDeclaration
                 *
                 * */
                logger.debug('node type : ' + path.get('type').node + ' ' + found_FunctionDeclaration)
                //path.insertAfter(t.expressionStatement(t.stringLiteral("// insert FunctionDeclaration pfe")));
                path.insertBefore(pfeCall('FunctionDeclaration', 3));
                logger.warn('insert pfe : FunctionDeclaration')
                found_FunctionDeclaration++


            },
            CallExpression: (path) => {
                /**
                 * pfe CallExpression RangeError
                 *
                 * RangeError: Maximum call stack size exceeded
                 * path.insertBefore(t.expressionStatement(t.stringLiteral("CallExpression pfe, cost 2 ")));
                 *
                 * */
            }
        }, post(state) {

            /**
             * validator logic
             *
             * */
            if (!found_ExportDefaultDeclaration) {
                found_errors.push('not found ExportDefaultDeclaration')
            } else {
                if (found_ExportDefaultDeclaration > foundMax_ExportDefaultDeclaration) {
                    found_errors.push('ExportDefaultDeclaration ' +
                        found_ExportDefaultDeclaration +
                        ' times payment, expect ' +
                        foundMax_ExportDefaultDeclaration)
                } else {
                    logger.info('found ExportDefaultDeclaration ' + found_ExportDefaultDeclaration + ' times payment')
                }
            }

            if (!found_ClassDeclaration) {
                found_errors.push('not found ClassDeclaration')
            } else {
                if (found_ClassDeclaration > foundMax_ClassDeclaration) {
                    found_errors.push('ClassDeclaration ' +
                        found_ClassDeclaration +
                        ' times payment, expect ' +
                        foundMax_ClassDeclaration)
                } else {
                    logger.info('found ClassDeclaration ' + found_ClassDeclaration + ' times payment')
                }
            }

            if (!found_ConstructorDeclaration) {
                found_errors.push('not found ConstructorDeclaration')
            } else {
                if (found_ConstructorDeclaration > foundMax_ConstructorDeclaration) {
                    found_errors.push('ConstructorDeclaration ' +
                        found_ConstructorDeclaration +
                        ' times payment, expect ' +
                        foundMax_ConstructorDeclaration)
                } else {
                    logger.info('found ConstructorDeclaration ' + found_ConstructorDeclaration + ' times payment')
                }
            }

            if (!found_FunctionDeclaration) {
                found_errors.push('not found FunctionDeclaration')
            } else {
                if (found_FunctionDeclaration > foundMax_FunctionDeclaration) {
                    found_errors.push('FunctionDeclaration ' +
                        found_FunctionDeclaration +
                        ' times payment, expect ' +
                        foundMax_FunctionDeclaration)
                } else {
                    logger.info('found FunctionDeclaration ' + found_FunctionDeclaration + ' times payment')
                }
            }

            if (!found_SuperDeclaration) {
                found_errors.push('not found SuperDeclaration')
            } else {
                if (found_SuperDeclaration > foundMax_SuperDeclaration) {
                    found_errors.push('SuperDeclaration ' +
                        found_SuperDeclaration +
                        ' times payment, expect ' +
                        foundMax_SuperDeclaration)
                } else {
                    logger.info('found SuperDeclaration ' + found_SuperDeclaration + ' times payment')
                }
            }
            if (!found_errors.length) {
                logger.warn('Succeseful! Contract ' + state.opts.basename + ' code and pfe transpiled.')
            } else {
                logger.error('Some errors found', found_errors)
            }

        }
    }
}
