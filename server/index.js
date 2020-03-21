const http = require('http')
const midi = require('./midi')

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

  const midiPatterns = []

  for (const channel in patterns) {
    for (const p of patterns[channel]) {
      // TODO p.pattern.values[1]
      const values = p.pattern.values[0]

      const ticksPerCycle = 24 * 4
      const ticksPerPattern = ticksPerCycle * p.pattern.cycles
      const ticksPerValue = ticksPerPattern / values.length

      const ticks = getTicksForValues(values, ticksPerValue)

      const midiPattern = {
        ticks: p.pattern.cycles * ticksPerCycle
      }

      for (const tick in ticks) {
        const value = ticks[tick]
        if (!midiPattern[tick]) midiPattern[tick] = []

        if (p.type === 'notes') {
          midiPattern[tick].push({
            type: 'noteon',
            note: value + 12 * p.octave,
            velocity: 127, // TODO
            channel: parseInt(channel) - 1
          })
        } else if (p.type === 'cc') {
          midiPattern[tick].push({
            type: 'cc',
            controller: p.controller,
            value: Math.min(1, value) * 127,
            channel: parseInt(channel) - 1
          })
        }
      }

      midiPatterns.push(midiPattern)
    }
  }

  console.log('midi patterns:', JSON.stringify(midiPatterns, null, 2))
  midi.setPatterns(midiPatterns)
}

function getTicksForValues (values, ticksPerValue) {
  const result = {}
  for (const index in values) {
    const value = values[index]
    const tick = Math.round(ticksPerValue * index)

    if (Array.isArray(value)) {
      const result_ = getTicksForValues(value, ticksPerValue / value.length)
      for (const tick_ in result_) {
        result[tick + parseInt(tick_)] = result_[tick_]
      }
    } else if (!isNaN(value)) {
      result[tick] = value
    } else {
      console.log(`skipping value "${value}" at tick ${tick}`)
    }

  }

  return result
}
