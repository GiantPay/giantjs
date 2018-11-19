import logger from '../../logger'

let validatorVars = {
    exportDefaultDeclaration: [0, 1], // [counter, maximum]
    classDeclaration: [0, 1],
    classMethodDeclaration: [0, 20],
    constructorDeclaration: [0, 1],
    constructorThisDeclaration: [0, 100],
    superDeclaration: [0, 1],
    functionDeclaration: [0, 100],
}

/**
 * Rules for the validation of a contract:
 * 1) must be declared class
 * 2) the class is inherited from Contract or from imported contract's class
 * 3) class must be exported by default
 * 4) the superclass must be imported from the module (check that the module is either GiantContract or the address of the contract)
 *
 * @returns ast validator info of the giant contract code
 */
export default () => {

    return {
        visitor: {
            Program: (path) => {
                path.traverse({
                    ExportDefaultDeclaration: (subPath) => {
                        /**
                         * validation ExportDefaultDeclaration
                         *
                         * */
                        validatorVars.exportDefaultDeclaration[0]++
                        subPath.stop()
                    }
                })
            },
            ClassDeclaration: (path) => {
                /**
                 * validation ClassDeclaration
                 *
                 * */
                validatorVars.classDeclaration[0]++
                path.traverse({
                    ClassMethod(subPath) {
                        /**
                         * validation ClassMethod
                         *
                         * */
                        let node = subPath.get('kind').node
                        if (node == 'constructor') {
                            /**
                             * validation Constructor
                             *
                             * */
                            validatorVars.constructorDeclaration[0]++

                            subPath.traverse({
                                CallExpression(subSubPath) {
                                    if (subSubPath.get('callee').get('type').node == 'Super') {
                                        /**
                                         * validation Super
                                         *
                                         * */
                                        validatorVars.superDeclaration[0]++
                                    }
                                }, ThisExpression(subSubPath) {
                                    /**
                                     * validation ThisExpression
                                     *
                                     * */
                                    validatorVars.constructorThisDeclaration[0]++
                                }
                            })
                        } else {
                            /**
                             * validation ClassMethodDeclaration
                             *
                             * */
                            validatorVars.classMethodDeclaration[0]++
                        }
                    }
                })
            },
            FunctionDeclaration: (path) => {
                /**
                 * validation FunctionDeclaration
                 *
                 * */
                validatorVars.functionDeclaration[0]++
            },
            CallExpression: (path) => {
                /**
                 * validation CallExpression RangeError
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
            for (let k in validatorVars) {
                if (!validatorVars[k][0]) {
                    foundErrors.push('not found ' + k)
                } else {
                    if (validatorVars[k][0] > validatorVars[k][1]) {
                        foundErrors.push(k + ' ' +
                            validatorVars[k][0] +
                            ' times, expect ' +
                            validatorVars[k][1])
                    } else {
                        logger.info('found ' + k + ' ' + validatorVars[k][0] + ' times')
                    }
                }
            }
            if (!foundErrors.length) {
                logger.warn('Contract ' + state.opts.basename + ' is valid')
            } else {
                logger.error('Some errors found', foundErrors)
                throw path.buildCodeFrameError('Contract ' + state.opts.basename + ' is not valid')
            }
        }
    }
}
