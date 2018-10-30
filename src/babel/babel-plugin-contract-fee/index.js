import logger from '../../logger'
import fs from 'fs'


/**
 * @returns write file PFE function of the giant contract code
 */
export default () => {
    const feePrice = 0.00000001
    var pfeCount = (price, declaration) => {
        let declarationPrice = price * feePrice
        return '\tcontractAmount += ' + declarationPrice +
            '\n\tconsole.log(\'Found ' + declaration +
            '. Price : ' + declarationPrice + '\')\n\tconsole.log(contractAmount.toFixed(8))\n'
    }
    var pfeFuncStr = ''

    return {
        pre(state) {
            pfeFuncStr += 'exports.Pfe = function() {\n\tvar contractAmount = 0\n'
        },
        visitor: {
            Program: (path) => {
                let foundClassDeclaration = false

                path.traverse({
                    ClassDeclaration: (subPath) => {
                        foundClassDeclaration = true
                        subPath.stop()
                    }
                })
            },
            ClassDeclaration: (path) => {
                let foundConstructor = false

                path.traverse({
                    ClassMethod(subPath) {
                        if (subPath.get('kind').node == 'constructor') {
                            foundConstructor = true
                            logger.info('found Constructor')
                            pfeFuncStr += pfeCount(20, subPath.get('kind').node)
                        }
                        subPath.stop()
                    }
                })

                if (!foundConstructor) {
                    throw path.buildCodeFrameError('Constructor not found')
                }
            },
            CallExpression: (path) => {
                if (path.isCallExpression()) {
                    logger.info('CallExpression ' + path.get('callee').get('type').node)
                    pfeFuncStr += pfeCount(30, path.get('callee').get('type').node)
                }
            }
        }, post(state) {
            pfeFuncStr += '\n\treturn contractAmount\n}'
            fs.writeFile(
                './build/contracts/' + state.opts.basename + 'Pfe.js',
                pfeFuncStr,
                (err) => {
                    if (err) {
                        return console.log(err);
                    }
                    logger.info('Function Pfe was created!')
                }
            )
        }
    }
}
