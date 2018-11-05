import logger from '../../logger'

/**
 * @returns ast and pfe functions of the giant contract code
 */
export default ({types: t}) => {
    let found_ExportDefaultDeclaration = false
    let found_ClassDeclaration = false

    let pfeFunction = {
        "body": [
            {
                "type": "FunctionDeclaration",
                "id": {
                    "type": "Identifier",
                    "name": "pfe"
                },
                "params": [
                    {
                        "type": "Identifier",
                        "name": "contractName"
                    },
                    {
                        "type": "Identifier",
                        "name": "declaration"
                    },
                    {
                        "type": "Identifier",
                        "name": "mockClient"
                    }
                ],
                "body": {
                    "type": "BlockStatement",
                    "body": [
                        {
                            "type": "VariableDeclaration",
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "Identifier",
                                        "name": "spendFee"
                                    },
                                    "init": {
                                        "type": "ObjectExpression",
                                        "properties": [
                                            {
                                                "type": "Property",
                                                "key": {
                                                    "type": "Identifier",
                                                    "name": "ClassDeclaration"
                                                },
                                                "value": {
                                                    "type": "Literal",
                                                    "value": 10,
                                                    "raw": "10"
                                                },
                                                "kind": "init"
                                            },
                                            {
                                                "type": "Property",
                                                "key": {
                                                    "type": "Identifier",
                                                    "name": "ClassMethod"
                                                },
                                                "value": {
                                                    "type": "Literal",
                                                    "value": 8,
                                                    "raw": "8"
                                                },
                                                "kind": "init"
                                            },
                                            {
                                                "type": "Property",
                                                "key": {
                                                    "type": "Identifier",
                                                    "name": "FunctionDeclaration"
                                                },
                                                "value": {
                                                    "type": "Literal",
                                                    "value": 8,
                                                    "raw": "8"
                                                },
                                                "kind": "init"
                                            }
                                        ]
                                    }
                                }
                            ],
                            "kind": "const"
                        },
                        {
                            "type": "VariableDeclaration",
                            "declarations": [
                                {
                                    "type": "VariableDeclarator",
                                    "id": {
                                        "type": "Identifier",
                                        "name": "arrayOfRequests"
                                    },
                                    "init": {
                                        "type": "ArrayExpression",
                                        "elements": []
                                    }
                                }
                            ],
                            "kind": "let"
                        },
                        {
                            "type": "ForStatement",
                            "init": {
                                "type": "VariableDeclaration",
                                "declarations": [
                                    {
                                        "type": "VariableDeclarator",
                                        "id": {
                                            "type": "Identifier",
                                            "name": "i"
                                        },
                                        "init": {
                                            "type": "Literal",
                                            "value": 0,
                                            "raw": "0"
                                        }
                                    }
                                ],
                                "kind": "let"
                            },
                            "test": {
                                "type": "BinaryExpression",
                                "left": {
                                    "type": "Identifier",
                                    "name": "i"
                                },
                                "operator": "<",
                                "right": {
                                    "type": "MemberExpression",
                                    "object": {
                                        "type": "Identifier",
                                        "name": "mockClient"
                                    },
                                    "property": {
                                        "type": "Identifier",
                                        "name": "length"
                                    },
                                }
                            },
                            "update": {
                                "type": "UpdateExpression",
                                "operator": "++",
                                "prefix": false,
                                "argument": {
                                    "type": "Identifier",
                                    "name": "i"
                                }
                            },
                            "body": {
                                "type": "BlockStatement",
                                "body": [
                                    {
                                        "type": "ExpressionStatement",
                                        "expression": {
                                            "type": "CallExpression",
                                            "callee": {
                                                "type": "MemberExpression",
                                                "object": {
                                                    "type": "Identifier",
                                                    "name": "arrayOfRequests"
                                                },
                                                "property": {
                                                    "type": "Identifier",
                                                    "name": "push"
                                                },
                                            },
                                            "arguments": [
                                                {
                                                    "type": "CallExpression",
                                                    "callee": {
                                                        "type": "Identifier",
                                                        "name": "checkBalance"
                                                    },
                                                    "arguments": [
                                                        {
                                                            "type": "MemberExpression",
                                                            "object": {
                                                                "type": "Identifier",
                                                                "name": "mockClient"
                                                            },
                                                            "property": {
                                                                "type": "Identifier",
                                                                "name": "i"
                                                            }
                                                        },
                                                        {
                                                            "type": "MemberExpression",
                                                            "object": {
                                                                "type": "Identifier",
                                                                "name": "spendFee"
                                                            },
                                                            "property": {
                                                                "type": "Identifier",
                                                                "name": "declaration"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    ]
                }
            }
        ]
    }

    let pfeCallFunction = {
        "body": [
            {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "Identifier",
                        "name": "pfe"
                    },
                    "arguments": [
                        {
                            "type": "Identifier",
                            "name": "contractName"
                        },
                        {
                            "type": "Identifier",
                            "name": "declaration"
                        },
                        {
                            "type": "Identifier",
                            "name": "mockClient"
                        }
                    ]
                }
            }
        ]
    }

    return {
        visitor: {
            Program: (path) => {
                path.traverse({
                    ExportDefaultDeclaration: (subPath) => {
                        logger.debug('node type : ' + subPath.get('type').node)
                        found_ExportDefaultDeclaration = true
                        subPath.insertAfter(pfeFunction)
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
                        subPath.insertAfter(pfeCallFunction)
                        subPath.stop()
                    }
                })
            },
            ClassMethod: (path) => {
                path.traverse({
                    //logger.debug('node type : ' + path.get('type').node)
                })

            },
            FunctionDeclaration: (subPath) => {
                subPath.insertAfter(pfeCallFunction)

            },
            CallExpression: (path) => {
                if (path.isCallExpression()) {
                    logger.debug('CallExpression callee type : ' + path.get('type').node)
                }
            }
        }, post(state) {

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
