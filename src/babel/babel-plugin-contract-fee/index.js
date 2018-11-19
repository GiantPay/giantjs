import logger from '../../logger'

let pfeVars = {
    exportDefaultDeclaration: {count: 0, max: 1, fee: 2},
    classDeclaration: {count: 0, max: 1, fee: 4},
    classMethodDeclaration: {count: 0, max: 20, fee: 8},
    constructorDeclaration: {count: 0, max: 1, fee: 12},
    constructorThisDeclaration: {count: 0, max: 100, fee: 12},
    superDeclaration: {count: 0, max: 1, fee: 12},
    functionDeclaration: {count: 0, max: 100, fee: 4}
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
                path.traverse({
                    ExportDefaultDeclaration: (subPath) => {

                        logger.debug('node type : ' + subPath.get('type').node)

                        /**
                         * pfe ExportDefaultDeclaration
                         *
                         * */
                        subPath.insertBefore(pfeCall('ExportDefaultDeclaration', pfeVars.exportDefaultDeclaration.fee));
                        logger.warn('insert pfe : ExportDefaultDeclaration')
                        pfeVars.exportDefaultDeclaration.count++
                        subPath.stop()
                    }
                })
            },
            ClassDeclaration: (path) => {
                /**
                 * pfe ClassDeclaration
                 *
                 * */
                logger.debug('node type : ' + path.get('type').node)
                path.insertBefore(pfeCall('ClassDeclaration', pfeVars.classDeclaration.fee));
                logger.warn('insert pfe : ClassDeclaration')
                pfeVars.classDeclaration.count++

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
                            subPath.insertBefore(pfeCall('Constructor', pfeVars.constructorDeclaration.fee));
                            logger.warn('insert pfe : Constructor')
                            pfeVars.constructorDeclaration.count++

                            subPath.traverse({
                                CallExpression(subSubPath) {
                                    if (subSubPath.get('callee').get('type').node == 'Super') {
                                        /**
                                         * pfe Super
                                         *
                                         * */
                                        logger.debug('constructor node type callee : ' + subSubPath.get('callee').get('type').node)
                                        path.insertBefore(pfeCall('Super', pfeVars.superDeclaration.fee))
                                        logger.warn('constructor insert pfe : Super')
                                        pfeVars.superDeclaration.count++
                                    }
                                }, ThisExpression(subSubPath) {
                                    /**
                                     * pfe ThisExpression
                                     *
                                     * */
                                    logger.debug('constructor node type : ' + subSubPath.get('type').node)
                                    path.insertBefore(pfeCall('ConstructorThis', pfeVars.constructorThisDeclaration.fee))
                                    logger.warn('constructor insert pfe : ConstructorThis')
                                    pfeVars.constructorThisDeclaration.count++
                                }
                            })
                        } else {
                            /**
                             * pfe ClassMethodDeclaration
                             *
                             * */
                            logger.debug('node type : ClassMethod kind ' + node)
                            path.insertBefore(pfeCall('ClassMethod', pfeVars.classMethodDeclaration.fee));
                            logger.warn('insert pfe : ClassMethod')
                            pfeVars.classMethodDeclaration.count++
                        }
                    }
                })
            },
            FunctionDeclaration: (path) => {
                /**
                 * pfe FunctionDeclaration
                 *
                 * */
                logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.functionDeclaration.count)
                path.insertBefore(pfeCall('FunctionDeclaration', pfeVars.functionDeclaration.fee));
                logger.warn('insert pfe : FunctionDeclaration')
                pfeVars.functionDeclaration.count++

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
            let foundErrors = []
            for (let k in pfeVars) {
                if (!pfeVars[k].count) {
                    foundErrors.push('not found ' + k)
                } else {
                    if (pfeVars[k].count > pfeVars[k].max) {
                        foundErrors.push(k + ' ' +
                            pfeVars[k].count +
                            ' times payment, expect max ' +
                            pfeVars[k].max)
                    } else {
                        logger.info('found ' + k + ' ' + pfeVars[k].count + ' times payment')
                    }
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
