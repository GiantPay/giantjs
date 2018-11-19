import logger from '../../logger'

let validatorVars = {
    exportDefaultDeclaration: {counter: 0, maximum: 1},
    classDeclaration: {counter: 0, maximum: 1},
    classMethodDeclaration: {counter: 0, maximum: 20},
    constructorDeclaration: {counter: 0, maximum: 1},
    constructorThisDeclaration: {counter: 0, maximum: 100},
    superDeclaration: {counter: 0, maximum: 1},
    functionDeclaration: {counter: 0, maximum: 100}
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
                        validatorVars.exportDefaultDeclaration.counter++
                        subPath.stop()
                    }
                })
            },
            ClassDeclaration: (path) => {
                /**
                 * validation ClassDeclaration
                 *
                 * */
                validatorVars.classDeclaration.counter++
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
                            validatorVars.constructorDeclaration.counter++

                            subPath.traverse({
                                CallExpression(subSubPath) {
                                    if (subSubPath.get('callee').get('type').node == 'Super') {
                                        /**
                                         * validation Super
                                         *
                                         * */
                                        validatorVars.superDeclaration.counter++
                                    }
                                }, ThisExpression(subSubPath) {
                                    /**
                                     * validation ThisExpression
                                     *
                                     * */
                                    validatorVars.constructorThisDeclaration.counter++
                                }
                            })
                        } else {
                            /**
                             * validation ClassMethodDeclaration
                             *
                             * */
                            validatorVars.classMethodDeclaration.counter++
                        }
                    }
                })
            },
            FunctionDeclaration: (path) => {
                /**
                 * validation FunctionDeclaration
                 *
                 * */
                validatorVars.functionDeclaration.counter++
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
                if (!validatorVars[k].counter) {
                    foundErrors.push('not found ' + k)
                } else {
                    if (validatorVars[k].counter > validatorVars[k].maximum) {
                        foundErrors.push(k + ' ' +
                            validatorVars[k].counter +
                            ' times, expect maximum ' +
                            validatorVars[k].maximum)
                    } else {
                        logger.info('found ' + k + ' ' + validatorVars[k].counter + ' times')
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
