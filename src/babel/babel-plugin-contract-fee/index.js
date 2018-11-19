import logger from '../../logger'

let pfeVars = {
    exportDefaultDeclaration: {counter: 0, maximum: 1, price: 2},
    classDeclaration: {counter: 0, maximum: 1, price: 4},
    classMethodDeclaration: {counter: 0, maximum: 20, price: 8},
    constructorDeclaration: {counter: 0, maximum: 1, price: 12},
    constructorThisDeclaration: {counter: 0, maximum: 100, price: 12},
    superDeclaration: {counter: 0, maximum: 1, price: 12},
    functionDeclaration: {counter: 0, maximum: 100, price: 4}
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
                        subPath.insertBefore(pfeCall('ExportDefaultDeclaration', pfeVars.exportDefaultDeclaration.price));
                        logger.warn('insert pfe : ExportDefaultDeclaration')
                        pfeVars.exportDefaultDeclaration.counter++
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
                path.insertBefore(pfeCall('ClassDeclaration', pfeVars.classDeclaration.price));
                logger.warn('insert pfe : ClassDeclaration')
                pfeVars.classDeclaration.counter++

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
                            subPath.insertBefore(pfeCall('Constructor', pfeVars.constructorDeclaration.price));
                            logger.warn('insert pfe : Constructor')
                            pfeVars.constructorDeclaration.counter++

                            subPath.traverse({
                                CallExpression(subSubPath) {
                                    if (subSubPath.get('callee').get('type').node == 'Super') {
                                        /**
                                         * pfe Super
                                         *
                                         * */
                                        logger.debug('constructor node type callee : ' + subSubPath.get('callee').get('type').node)
                                        path.insertBefore(pfeCall('Super', pfeVars.superDeclaration.price))
                                        logger.warn('constructor insert pfe : Super')
                                        pfeVars.superDeclaration.counter++
                                    }
                                }, ThisExpression(subSubPath) {
                                    /**
                                     * pfe ThisExpression
                                     *
                                     * */
                                    logger.debug('constructor node type : ' + subSubPath.get('type').node)
                                    path.insertBefore(pfeCall('ConstructorThis', pfeVars.constructorThisDeclaration.price))
                                    logger.warn('constructor insert pfe : ConstructorThis')
                                    pfeVars.constructorThisDeclaration.counter++
                                }
                            })
                        } else {
                            /**
                             * pfe ClassMethodDeclaration
                             *
                             * */
                            logger.debug('node type : ClassMethod kind ' + node)
                            path.insertBefore(pfeCall('ClassMethod', pfeVars.classMethodDeclaration.price));
                            logger.warn('insert pfe : ClassMethod')
                            pfeVars.classMethodDeclaration.counter++
                        }
                    }
                })
            },
            FunctionDeclaration: (path) => {
                /**
                 * pfe FunctionDeclaration
                 *
                 * */
                logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.functionDeclaration.counter)
                path.insertBefore(pfeCall('FunctionDeclaration', pfeVars.functionDeclaration.price));
                logger.warn('insert pfe : FunctionDeclaration')
                pfeVars.functionDeclaration.counter++

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
                if (!pfeVars[k].counter) {
                    foundErrors.push('not found ' + k)
                } else {
                    if (pfeVars[k].counter > pfeVars[k].maximum) {
                        foundErrors.push(k + ' ' +
                            pfeVars[k].counter +
                            ' times payment, expect maximum ' +
                            pfeVars[k].maximum)
                    } else {
                        logger.info('found ' + k + ' ' + pfeVars[k].counter + ' times payment')
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
