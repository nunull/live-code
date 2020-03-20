const http = require('http')

const port = process.env.PORT || 3000

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`)
  if (req.method === 'POST' && url.pathname === '/patterns') {
    let body = []
  	req.on('data', chunk => body.push(chunk))
    req.on('end', () => {
  		body = Buffer.concat(body).toString()

  		handlePatterns(JSON.parse(body))

    	res.writeHead(200)
  		res.end()
  	})
  } else {
    res.writeHead(500)
    res.end()
  }
})

server.listen(port, () => console.log(`listening on ${port}`))

function handlePatterns (patterns) {
  console.log('patterns:', JSON.stringify(patterns, null, 2))
}
