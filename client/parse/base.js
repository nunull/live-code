const parseError = require('./error')

exports.match = match
function match (tokens, regex) {
  const token = tokens.shift()
  if (!token) throw parseError(`expected "${regex}", but got EOF`)
  if (!regex.test(token.value)) {
    tokens.unshift(token)
    throw parseError(`${token.value} does not match ${regex}`, token)
  }
  return token.value
}

exports.identifier = identifier
function identifier (tokens) {
  try {
    return { type: 'identifier', value: match(tokens, /^[a-zA-Z0-9]+$/) }
  } catch (err) {
    if (err.token) throw parseError(`${err.token.value} is not a valid identifier`, err.token)
    else throw err
  }
}

exports.number = number
function number (tokens) {
  try {
    return { type: 'value', value: parseFloat(match(tokens, /^[0-9]+(\.[0-9]+)?$/)) }
  } catch (err) {
    if (err.token) throw parseError(`${err.token.value} is not a number`, err.token)
    else throw err
  }
}

exports.literal = literal
function literal (tokens, literal) {
  const token = tokens.shift()
  if (!token) throw parseError(`expected "${literal}", but got EOF`)
  if (token.value !== literal) {
    tokens.unshift(token)
    throw parseError(`expected "${literal}", but got "${token.value}"`, token)
  }
  return token
}
