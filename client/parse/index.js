const tokenize = require('./tokenize')
const parseError = require('./error')
const language = require('./language')

module.exports = parse

function parse (input, bindings) {
  const tokens = tokenize(input)
  const ast = language.script(tokens)
  if (tokens.length !== 0) {
    throw parseError(`expected EOF, but got "${tokens[0].value}"`, tokens[0])
  }
  return ast
}
