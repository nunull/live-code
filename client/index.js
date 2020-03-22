const fs = require('fs')
const http = require('http')
const bindings = require('./bindings')
const exec = require('./exec')
const parse = require('./parse')

const serverAddress = process.env.SERVER_ADDRESS || 'http://localhost:3000'

if (process.argv.length !== 3) {
  console.log('Usage: node client/index.js <file>')
  process.exit(1)
}

const file = process.argv[2]
const code = fs.readFileSync(file, 'utf-8')

run(code, bindings)

function run (input, bindings) {
  const ast = parse(input)
  console.log('ast:', JSON.stringify(ast, null, 2))

  const scope = exec(ast, bindings)
  console.log('scope:', JSON.stringify(scope, null, 2))

  const req = http.request(`${serverAddress}/patterns`, {
    method: 'POST'
  })

  req.on('error', err => {
    console.log(`request error: ${err.message}`)
    throw err
  })

  req.write(JSON.stringify(scope))
  req.end()
}
