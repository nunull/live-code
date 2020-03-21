const base = require('./base')
const helpers = require('./helpers')

exports.pattern = pattern
function pattern (tokens) {
  if (tokens.length === 0) return []

  return helpers.many(tokens, tokens => {
    let [err, token] = helpers.optional(tokens, tokens => base.number(tokens))
    if (err) [err, token] = helpers.optional(tokens, tokens => base.identifier(tokens))
    if (err) {
      return helpers.surroundedBy(tokens, '[', ']', tokens => pattern(tokens))
    }

    return token.value
  })
}

exports.quotedPattern = quotedPattern
function quotedPattern (tokens) {
  const value = helpers.surroundedBy(tokens, '"', '"', tokens => pattern(tokens))
  return { type: 'pattern', value }
}

exports.parameters = parameters
function parameters (tokens) {
  // TODO use many instead of recursion
  // TODO add any helper
  let [err, param] = helpers.optional(tokens, tokens => quotedPattern(tokens))
  if (err) [err, param] = helpers.optional(tokens, tokens => base.number(tokens))
  if (err) [err, param] = helpers.optional(tokens, tokens => base.identifier(tokens))
  if (err) [err, param] = helpers.optional(tokens, tokens =>
    helpers.surroundedBy(tokens, '(', ')', tokens => pipedExpression(tokens)))

  if (!param) return []

  const params = parameters(tokens)
  return [param].concat(params)
}

exports.functionCall = functionCall
function functionCall (tokens) {
  helpers.optional(tokens, tokens => base.literal(tokens, '\n'))

  const id = base.identifier(tokens).value
  const params = parameters(tokens)

  return { type: 'functionCall', name: id, params }
}

exports.pipedExpression = pipedExpression
function pipedExpression (tokens) {
  // TODO is this good here?
  const [_, openingBrace] = helpers.optional(tokens, tokens => base.literal(tokens, '('))
  const f = functionCall(tokens)
  if (openingBrace) base.literal(tokens, ')')

  const fs = helpers.many(tokens, tokens => {
    // TODO how should newlines be handled in general
    helpers.skipNewlines(tokens)
    base.literal(tokens, '|')
    helpers.skipNewlines(tokens)

    // TODO is this good here?
    const [_, openingBrace] = helpers.optional(tokens, tokens => base.literal(tokens, '('))
    const f = functionCall(tokens)
    if (openingBrace) base.literal(tokens, ')')
    return f
  })

  return { type: 'pipedExpression', value: [f].concat(fs) }
}

exports.plusExpression = plusExpression
function plusExpression (tokens) {
  const firstValue = pipedExpression(tokens)
  const values = helpers.many(tokens, tokens => {
    helpers.skipNewlines(tokens)
    base.literal(tokens, '+')
    helpers.skipNewlines(tokens)
    return pipedExpression(tokens)
  })
  return { type: 'plusExpression', value: [firstValue].concat(values) }
}

exports.assignment = assignment
function assignment (tokens) {
  const id = base.identifier(tokens).value
  base.literal(tokens, '=')
  const value = plusExpression(tokens)
  return { type: 'assignment', id, value }
}

exports.script = script
function script (tokens) {
  const value = helpers.many(tokens, tokens => {
    helpers.skipNewlines(tokens)
    return assignment(tokens)
  })
  helpers.skipNewlines(tokens)

  return { type: 'script', value }
}
