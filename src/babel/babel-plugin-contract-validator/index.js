import logger from '../../logger'

let validatorVars = {
    exportDefaultDeclaration: {count: 0, max: 1},
    classDeclaration: {count: 0, max: 1},
    classMethodDeclaration: {count: 0, max: 20},
    constructorDeclaration: {count: 0, max: 1},
    constructorThisDeclaration: {count: 0, max: 100},
    superDeclaration: {count: 0, max: 1},
    functionDeclaration: {count: 0, max: 100}
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
                        validatorVars.exportDefaultDeclaration.count++
                        subPath.stop()
                    }
                })
            },
            ClassDeclaration: (path) => {
                /**
                 * validation ClassDeclaration
                 *
                 * */
                validatorVars.classDeclaration.count++
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
                            validatorVars.constructorDeclaration.count++

                            subPath.traverse({
                                CallExpression(subSubPath) {
                                    if (subSubPath.get('callee').get('type').node == 'Super') {
                                        /**
                                         * validation Super
                                         *
                                         * */
                                        validatorVars.superDeclaration.count++
                                    }
                                }, ThisExpression(subSubPath) {
                                    /**
                                     * validation ThisExpression
                                     *
                                     * */
                                    validatorVars.constructorThisDeclaration.count++
                                }
                            })
                        } else {
                            /**
                             * validation ClassMethodDeclaration
                             *
                             * */
                            validatorVars.classMethodDeclaration.count++
                        }
                    }
                })
            },
            FunctionDeclaration: (path) => {
                /**
                 * validation FunctionDeclaration
                 *
                 * */
                validatorVars.functionDeclaration.count++
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
                if (!validatorVars[k].count) {
                    foundErrors.push('not found ' + k)
                } else {
                    if (validatorVars[k].count > validatorVars[k].max) {
                        foundErrors.push(k + ' ' +
                            validatorVars[k].count +
                            ' times, expect max ' +
                            validatorVars[k].max)
                    } else {
                        logger.info('found ' + k + ' ' + validatorVars[k].count + ' times')
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
