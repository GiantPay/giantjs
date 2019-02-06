import giantConfig from '../../config'
import logger from '../../logger'

const getMetadata = (path) => {
    const programNode = path.find((p) => p.isProgram())
    const rootNode = programNode.parent
    if (rootNode) {
        if (!rootNode.metadata) {
            rootNode.metadata = {}
        }
        return rootNode.metadata
    }
    throw new Error('"file" node doesn\'t found')
}

export default (babel) => {
    return {
        visitor: {
            ExportDefaultDeclaration: (path) => {
                const metadata = getMetadata(path)
                const declaration = path.get('declaration')

                metadata.className = declaration.get('id').node.name
                metadata.methods = []
                metadata.deployFee = 1000

                logger.warn(`Calculate fee for deploy ${giantConfig.debug}`)
                if(giantConfig.debug){
                    console.log('pfe analysis - metadata.deployFee')
                }
                declaration.traverse({
                    ClassMethod (path) {
                        metadata.methods.push({
                            name: path.get('key').node.name,
                            params: path.get('params').map((param) => param.node.name),
                            type: path.get('kind').node
                        })
                    }
                })
            }
        }
    }
}
