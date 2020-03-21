const base = require('./base')
const parseError = require('./error')

exports.many = many
function many (tokens, f) {
  const result = []

  let err, node
  while (true) {
    [err, node] = optional(tokens, f)
    if (err) return result

    result.push(node)
  }

  return []
}

exports.surroundedBy = surroundedBy
function surroundedBy (tokens, begin, end, f) {
  const tokensCopy = tokens.slice()

  base.literal(tokens, begin)

  let err, result, _

  [err, result] = optional(tokens, tokens => f(tokens))
  if (err) {
    readdLostTokens(tokens, tokensCopy)
    throw err
  }

  [err, _] = optional(tokens, tokens => base.literal(tokens, end))
  if (err) {
    readdLostTokens(tokens, tokensCopy)
    throw err
  }

  return result
}

exports.optional = optional
function optional (tokens, f) {
  const tokensCopy = tokens.slice()

  try {
    const result = f(tokens)
    return [null, result]
  } catch (err) {
    readdLostTokens(tokens, tokensCopy)
    return [err, null]
  }
}

exports.readdLostTokens = readdLostTokens
function readdLostTokens (tokens, tokensCopy) {
  const lostTokens = tokensCopy.slice(0, tokensCopy.length - tokens.length)
  if (lostTokens.length !== 0) tokens.splice(0, 0, ...lostTokens)
}

exports.skipNewlines = skipNewlines
function skipNewlines (tokens) {
  many(tokens, tokens => base.literal(tokens, '\n'))
}
