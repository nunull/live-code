module.exports = tokenize

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

  // TODO make this a special value
  // tokens.push({ value: 'EOF', column: column + buffer.length, line })

  return tokens
}
