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
                    // TODO need to output additional information
                    console.log('No default export detected')
                    process.exit(1)
                }
            },
            ExportDefaultDeclaration: (path) => {
                const declaration = path.get('declaration')

                if (!declaration.isClassDeclaration()) {
                    // TODO need to output additional information
                    console.log('By default, not a class is exported')
                    process.exit(1)
                }

                const className = declaration.get('id').name
                const superClass = declaration.node.superClass

                if (!superClass) {
                    // TODO need to output additional information
                    console.log('The class of the contract must be the heir of the Contract')
                    process.exit(1)
                }

                // TODO need to verify that the class is in the correct inheritance hierarchy
            }
        }
    }
}
