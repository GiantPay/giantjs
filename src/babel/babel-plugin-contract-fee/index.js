import logger from '../../logger'

let pfeVars = {
    ExportDefaultDeclaration: [0, 1, 2], // [counter, maximum, price]
    ClassDeclaration: [0, 1, 4],
    ClassMethodDeclaration: [0, 20, 8],
    ConstructorDeclaration: [0, 1, 10],
    ConstructorThisDeclaration: [0, 100, 12],
    SuperDeclaration: [0, 1, 12],
    FunctionDeclaration: [0, 100, 4],
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
                        subPath.insertBefore(pfeCall('ExportDefaultDeclaration', 4, pfeVars.ExportDefaultDeclaration[2]));
                        logger.warn('insert pfe : ExportDefaultDeclaration')
                        pfeVars.ExportDefaultDeclaration[0]++
                        subPath.stop()
                    }
                })
            },
            ClassDeclaration: (path) => {

                logger.debug('node type : ' + path.get('type').node)
                path.insertBefore(pfeCall('ClassDeclaration', 3, pfeVars.ClassDeclaration[2]));
                logger.warn('insert pfe : ClassDeclaration')
                pfeVars.ClassDeclaration[0]++

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
                            subPath.insertBefore(pfeCall('Constructor', 10, pfeVars.ConstructorDeclaration[2]));
                            logger.warn('insert pfe : Constructor')
                            pfeVars.ConstructorDeclaration[0]++

                            subPath.traverse({
                                CallExpression(subSubPath) {
                                    if (subSubPath.get('callee').get('type').node == 'Super') {
                                        /**
                                         * pfe Super
                                         *
                                         * */
                                        logger.debug('constructor node type callee : ' + subSubPath.get('callee').get('type').node)
                                        path.insertBefore(pfeCall('Super', 10, pfeVars.SuperDeclaration[2]))
                                        logger.warn('constructor insert pfe : Super')
                                        pfeVars.SuperDeclaration[0]++
                                    }
                                }, ThisExpression(subSubPath) {
                                    /**
                                     * pfe ThisExpression
                                     *
                                     * */
                                    logger.debug('constructor node type : ' + subSubPath.get('type').node)
                                    path.insertBefore(pfeCall('ConstructorThis', 8, pfeVars.ConstructorThisDeclaration[2]))
                                    logger.warn('constructor insert pfe : ConstructorThis')
                                    pfeVars.ConstructorThisDeclaration[0]++
                                }
                            })
                        } else {
                            /**
                             * pfe ClassMethodDeclaration
                             *
                             * */
                            logger.debug('node type : ClassMethod kind ' + node)
                            path.insertBefore(pfeCall('ClassMethod', 5, pfeVars.ClassMethodDeclaration[2]));
                            logger.warn('insert pfe : ClassMethod')
                            pfeVars.ClassMethodDeclaration[0]++
                        }
                    }
                })
            },
            FunctionDeclaration: (path) => {
                /**
                 * pfe FunctionDeclaration
                 *
                 * */
                logger.debug('node type : ' + path.get('type').node + ' ' + pfeVars.FunctionDeclaration[0])
                //path.insertAfter(t.expressionStatement(t.stringLiteral("// insert FunctionDeclaration pfe")));
                path.insertBefore(pfeCall('FunctionDeclaration', 3, pfeVars.FunctionDeclaration[2]));
                logger.warn('insert pfe : FunctionDeclaration')
                pfeVars.FunctionDeclaration[0]++

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
            for (var k in pfeVars) {
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
