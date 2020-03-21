module.exports = parseError

function parseError(message, token) {
  const tokenMessage = token ? ` (${token.line + 1}:${token.column})` : ''
  return {
    name: 'ParseError',
    message: `${message.replace('\n', '\\n')}${tokenMessage}`,
    token
  }
}
