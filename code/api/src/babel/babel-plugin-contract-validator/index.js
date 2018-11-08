import logger from '../../logger'

/**
 * Rules for the validation of a contract:
 * 1) must be declared class
 * 2) the class is inherited from Contract or from imported contract's class
 * 3) class must be exported by default
 * 4) the superclass must be imported from the module (check that the module is either GiantContract or the address of the contract)
 *
 * @returns validator of the giant contract code
 */
export default () => {
    return {
        visitor: {
            Program: (path) => {
                let foundExportDefaultDeclaration = false

                path.traverse({
                    ExportDefaultDeclaration: (subPath) => {
                        foundExportDefaultDeclaration = true
                        subPath.stop()
                    }
                })

                if (!foundExportDefaultDeclaration) {
                    throw path.buildCodeFrameError('No default export detected')
                }
            },
            ExportDefaultDeclaration: (path) => {
                const declaration = path.get('declaration')

                if (!declaration.isClassDeclaration()) {
                    throw path.buildCodeFrameError('By default, not a class is exported')
                }

                const className = declaration.get('id').name
                const superClass = declaration.node.superClass

                if (!superClass) {
                    throw path.buildCodeFrameError('The class of the contract must be the heir of the Contract')
                }

                // TODO need to verify that the class is in the correct inheritance hierarchy
            }
        }
    }
}
