const Pattern = require('../common/pattern')

module.exports = function exec (ast, bindings) {
  const scope = {}

  if (ast.type !== 'script') throw execError(`expected script`)
  for (const assignment of ast.value) {
    if (assignment.type !== 'assignment') throw execError(`expected assignment`)

    const value = execPipedExpression(assignment.value, bindings)
    scope[assignment.id] = value
  }

  return scope
}

function execPipedExpression (pipedExpression, bindings) {
  if (pipedExpression.type !== 'pipedExpression') throw execError(`expected pipedExpression`)

  let previousResult
  for (const functionCall of pipedExpression.value.reverse()) {
    if (functionCall.type !== 'functionCall') throw execError(`expected functionCall`)

    const previousResultParams = previousResult
      ? [{ type: 'value', value: previousResult }]
      : []
    const params = functionCall.params.concat(previousResultParams)
    previousResult = execFunctionCall(functionCall.name, params, bindings)
  }

  return previousResult
}

function execFunctionCall (name, params, bindings) {
  const paramValues = []
  for (const param of params) {
    if (param.type === 'value') {
      paramValues.push(param.value)
    } else if (param.type === 'pattern') {
      paramValues.push(new Pattern(param.value))
    } else if (param.type === 'functionCall') {
      paramValues.push(execFunctionCall(param.name, param.params, bindings))
    } else if (param.type === 'pipedExpression') {
      paramValues.push(execPipedExpression(param, bindings))
    } else {
      throw execError(`unexpected "${param.type}" for param`)
    }
  }

  const f = bindings[name]
  if (!f) throw execError(`function "${name}" not bound`)

  const willExec = paramValues.length >= f.length

  console.log('executing:', willExec
    ? `${name}(${paramValues.join(', ')})`
    : `${name}.bind(undefined, ${paramValues.join(', ')})`)

  const result = willExec ? f(...paramValues) : f.bind(undefined, ...paramValues)

  console.log(`result: ${result}`)

  return result
}

function execError (message) {
  return { name: 'ExecError', message }
}
