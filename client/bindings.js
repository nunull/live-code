const helpers = require('./helpers')

exports.n = n
function n (pattern) {
  return { type: 'notes', octave: 3, pattern }
}

exports.cc = cc
function cc (controller, pattern) {
  return { type: 'cc', controller, pattern }
}

exports.fast = fast
function fast (n, pattern) {
  return helpers.modifyObj(pattern, pattern => {
    pattern.cycles = pattern.cycles * (1 / n)
  })
}

exports.slow = slow
function slow (n, pattern) {
  return helpers.modifyObj(pattern, pattern => {
    pattern.cycles = pattern.cycles * n
  })
}

exports.rev = rev
function rev (pattern) {
  return helpers.modifyObj(pattern, pattern => {
    pattern.values = helpers.reverseArray(pattern.values)
  })
}

exports.every = every
function every (n, f, pattern) {
  const clone = f(helpers.cloneObj(pattern))
  return helpers.modifyObj(pattern, pattern => {
    pattern.values = helpers.repeatArray(n - 1, pattern.values).concat(clone.values)
    pattern.cycles *= n
    // TODO clone.cycles (e.g. every 2 (slow 2))
  })
}

// exports.chop = chop
// function chop (ns, pattern) {
//   // TODO
//   return pattern
// }
