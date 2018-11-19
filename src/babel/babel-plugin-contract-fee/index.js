import logger from '../../logger'

let pfeVars = {
    exportDefaultDeclaration: [0, 1, 2], // [counter, maximum, price]
    classDeclaration: [0, 1, 4],
    classMethodDeclaration: [0, 20, 8],
    constructorDeclaration: [0, 1, 10],
    constructorThisDeclaration: [0, 100, 12],
    superDeclaration: [0, 1, 12],
    functionDeclaration: [0, 100, 4],
}

/**
 * @returns ast and pfe functions of the giant contract code
 */
export default ({types: t, template: template}) => {

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
                        subPath.insertBefore(pfeCall('ExportDefaultDeclaration', pfeVars.exportDefaultDeclaration[2]));
                        logger.warn('insert pfe : ExportDefaultDeclaration')
                        pfeVars.exportDefaultDeclaration[0]++
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
                path.insertBefore(pfeCall('ClassDeclaration', pfeVars.classDeclaration[2]));
                logger.warn('insert pfe : ClassDeclaration')
                pfeVars.classDeclaration[0]++

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
                            subPath.insertBefore(pfeCall('Constructor', pfeVars.constructorDeclaration[2]));
                            logger.warn('insert pfe : Constructor')
                            pfeVars.constructorDeclaration[0]++

                            subPath.traverse({
                                CallExpression(subSubPath) {
                                    if (subSubPath.get('callee').get('type').node == 'Super') {
                                        /**
                                         * pfe Super
                                         *
                                         * */
                                        logger.debug('constructor node type callee : ' + subSubPath.get('callee').get('type').node)
                                        path.insertBefore(pfeCall('Super', pfeVars.superDeclaration[2]))
                                        logger.warn('constructor insert pfe : Super')
                                        pfeVars.superDeclaration[0]++
                                    }
                                }, ThisExpression(subSubPath) {
                                    /**
                                     * pfe ThisExpression
                                     *
                                     * */
                                    logger.debug('constructor node type : ' + subSubPath.get('type').node)
                                    path.insertBefore(pfeCall('ConstructorThis', pfeVars.constructorThisDeclaration[2]))
                                    logger.warn('constructor insert pfe : ConstructorThis')
                                    pfeVars.constructorThisDeclaration[0]++
                                }
                            })
                        } else {
                            /**
                             * pfe ClassMethodDeclaration
                             *
                             * */
                            logger.debug('node type : ClassMethod kind ' + node)
                            path.insertBefore(pfeCall('ClassMethod', pfeVars.classMethodDeclaration[2]));
                            logger.warn('insert pfe : ClassMethod')
                            pfeVars.classMethodDeclaration[0]++
                        }
                    }
                })
            },
            FunctionDeclaration: (path) => {
                /**
                 * pfe FunctionDeclaration
                 *
                 * */
                logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.functionDeclaration[0])
                path.insertBefore(pfeCall('FunctionDeclaration', pfeVars.functionDeclaration[2]));
                logger.warn('insert pfe : FunctionDeclaration')
                pfeVars.functionDeclaration[0]++

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
            let found_errors = []
            for (let k in pfeVars) {
                if (!pfeVars[k][0]) {
                    found_errors.push('not found ' + k)
                } else {
                    if (pfeVars[k][0] > pfeVars[k][1]) {
                        found_errors.push(k + ' ' +
                            pfeVars[k][0] +
                            ' times payment, expect ' +
                            pfeVars[k][1])
                    } else {
                        logger.info('found ' + k + ' ' + pfeVars[k][0] + ' times payment')
                    }
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
