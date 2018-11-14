import logger from '../../logger'

/**
 * @returns ast and pfe functions of the giant contract code
 */
export default ({types: t, template: template}) => {
    let found_ExportDefaultDeclaration = false
    let found_ClassDeclaration = false

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
                        //subPath.insertAfter(t.expressionStatement(t.stringLiteral("ExportDefaultDeclaration pfe, cost 3 ")));

                        /**
                         * pfe ExportDefaultDeclaration
                         *
                         * */
                        logger.debug('insert pfe : ExportDefaultDeclaration')
                        //  path.insertBefore(pfeCall('ExportDefaultDeclaration', 4));

                        found_ExportDefaultDeclaration = true
                        subPath.stop()
                    }
                })
            },
            ClassDeclaration: (path) => {

                logger.debug('node type : ' + path.get('type').node)

                found_ClassDeclaration = true
                path.traverse({
                    ClassMethod(subPath) {
                        logger.debug('node type : ' + subPath.get('type').node)
                        let node = subPath.get('kind').node
                        logger.debug('node type : ' + node)

                        /**
                         * pfe ClassMethod
                         *
                         * */
                        logger.debug('insert pfe : ClassMethod')
                        path.insertAfter(pfeCall('ClassMethod', 5));

                        if (node == 'constructor') {

                            /**
                             * pfe Constructor its ClassMethod
                             * other ClassMethods is FunctionDeclaration
                             *
                             * logger.debug('insert pfe : Constructor')
                             * path.insertAfter(pfeCall('Constructor', 10));
                             *
                             *
                             * */


                        }
                        subPath.stop()
                    }
                })
                path.insertAfter(pfeCall('ClassDeclaration', 3));
            },

            FunctionDeclaration: (path) => {

                logger.debug('node type : ' + path.get('type').node)

                /**
                 * pfe FunctionDeclaration
                 *
                 * */
                logger.debug('insert pfe : FunctionDeclaration')
                path.insertBefore(pfeCall('FunctionDeclaration', 3));

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
                // throw path.buildCodeFrameError('ExportDefaultDeclaration not found')
            }
            if (!found_ClassDeclaration) {
                // throw path.buildCodeFrameError('ClassDeclaration not found')
            }
            logger.debug('Contract ' + state.opts.basename + ' code and pfe transpiled')
        }
    }
}
