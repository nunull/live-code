module.exports = parse

function parse (input, bindings) {
  const tokens = tokenize(input)
  const ast = script(tokens)
  if (tokens.length !== 0) {
    throw parseError(`expected EOF, but got "${tokens[0].value}"`, tokens[0])
  }
  return ast
}

function tokenize (input) {
  const controlChars = [' ', '"', '[', ']', '|', '(', ')', '=', '\n']

  const tokens = []
  let buffer = ''
  let column = 0
  let line = 0
  for (let i = 0; i < input.length; i++) {
    const c = input[i]

    if (controlChars.indexOf(c) !== -1) {
      if (buffer !== '') tokens.push({ value: buffer, column, line })

      buffer = ''
      column = i

      if (c !== ' ') tokens.push({ value: c, column: i, line })
      if (c === '\n') line++

      continue
    }

    buffer += c
  }

  if (buffer !== '') tokens.push({ value: buffer, column, line })

  return tokens
}

function parseError(message, token) {
  const tokenMessage = token ? ` (${token.line + 1}:${token.column})` : ''
  return {
    name: 'ParseError',
    message: `${message.replace('\n', '\\n')}${tokenMessage}`,
    token
  }
}



// parsers

function match (tokens, regex) {
  const token = tokens.shift()
  if (!regex.test(token.value)) {
    tokens.unshift(token)
    throw parseError(`${token.value} does not match ${regex}`, token)
  }
  return token.value
}

function identifier (tokens) {
  try {
    return { type: 'identifier', value: match(tokens, /^[a-zA-Z0-9]+$/) }
  } catch (err) {
    throw parseError(`${err.token.value} is not a valid identifier`, err.token)
  }
}

function number (tokens) {
  try {
    return { type: 'value', value: match(tokens, /^[0-9]+$/) }
  } catch (err) {
    throw parseError(`${err.token.value} is not a number`, err.token)
  }
}

function literal (tokens, literal) {
  const token = tokens.shift()
  if (token.value !== literal) {
    tokens.unshift(token)
    throw parseError(`expected "${literal}", but got "${token.value}"`, token)
  }
  return token
}

function pattern (tokens) {
  if (tokens.length === 0) return []

  const [err, id] = optional(tokens, tokens => identifier(tokens))
  if (!err) {
    return [id.value].concat(pattern(tokens))
  } else {
    const subpattern = surroundedBy(tokens, '[', ']', tokens => {
      return pattern(tokens)
    })
    return [subpattern]
  }
}

function quotedPattern (tokens) {
  const value = surroundedBy(tokens, '"', '"', tokens => pattern(tokens))
  return { type: 'pattern', value }
}

function parameters (tokens) {
  let [err, param] = optional(tokens, tokens => quotedPattern(tokens))
  if (err) [err, param] = optional(tokens, tokens => number(tokens))
  if (err) [err, param] = optional(tokens, tokens =>
    surroundedBy(tokens, '(', ')', tokens => pipedExpression(tokens))
  )

  if (!param) return []

  const params = parameters(tokens)
  return [param].concat(params)
}

function functionCall (tokens) {
  optional(tokens, tokens => literal(tokens, '\n'))

  const id = identifier(tokens).value
  const params = parameters(tokens)

  return { type: 'functionCall', name: id, params }
}

function pipedExpression (tokens) {
  const [_, openingBrace] = optional(tokens, tokens => literal(tokens, '('))

  const f = functionCall(tokens)

  // TODO
  if (openingBrace) literal(tokens, ')')

  optional(tokens, tokens => literal(tokens, '\n'))
  const [err, __] = optional(tokens, tokens => literal(tokens, '|'))
  if (err) return { type: 'pipedExpression', value: [f] }

  const fs = pipedExpression(tokens)

  return { type: 'pipedExpression', value: [f].concat(fs.value) }
}

function assignment (tokens) {
  const id = identifier(tokens).value
  literal(tokens, '=')
  const value = pipedExpression(tokens)
  return { type: 'assignment', id, value }
}

function script (tokens) {
  const value = many(tokens, tokens => {
    many(tokens, tokens => literal(tokens, '\n'))
    return assignment(tokens)
  })

  return { type: 'script', value }
}



// parser helpers

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

function surroundedBy (tokens, begin, end, f) {
  const beginToken = literal(tokens, begin)

  const endIndex = tokens.findIndex(token => token.value === end)
  const tokens_ = tokens.slice(0, endIndex)

  const result = f(tokens_)
  if (tokens_.length > 0) {
    tokens.unshift(beginToken)
    throw parseError(`expected '${end}', but got '${tokens_[0].value}'`, tokens_[0])
  }
  tokens.splice(0, endIndex)

  literal(tokens, end)

  return result
}

function optional (tokens, f) {
  const tokensCopy = tokens.slice()

  try {
    const result = f(tokens)
    return [null, result]
  } catch (err) {
    const lostTokens = tokensCopy.slice(0, tokensCopy.length - tokens.length)
    tokens.splice(...lostTokens)

    return [err, null]
  }
}
