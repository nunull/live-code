const easymidi = require('easymidi')

let patterns = []
let mappingEvent = null
// let mappingEvent = { type: 'cc', controller: 0, value: 0, channel: 0 }

exports.setPatterns = p => patterns = p

const input = new easymidi.Input('live-code-server', true)
const output  = new easymidi.Output('live-code-server', true)

function send (tick, relativeTick, type, event) {
  output.send(type, event)
  console.log(tick, relativeTick, type, event)
}

function onTick (tick) {
  if (mappingEvent) return send(tick, tick, mappingEvent.type, mappingEvent)

  for (const pattern of patterns) {
    const relativeTick = tick % pattern.ticks
    const events = pattern[`${relativeTick}`] || []

    for (const event of events) {
      send(tick, relativeTick, event.type, event)

      // TODO duration
      if (event.type === 'noteon') {
        setTimeout(() => send(tick, relativeTick, 'noteoff', event), 300)
      }
    }
  }
}

let tick = 0

input.on('clock', () => {
  onTick(tick)
  tick++
})

input.on('start', () => {
  tick = 0
  console.log('midi start')
})

input.on('stop', () => {
  console.log('midi stop')
})
