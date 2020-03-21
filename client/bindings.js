const helpers = require('./helpers')

exports.n = n
function n (pattern) {
  return { type: 'notes', pattern }
}

exports.cc = cc
function cc (controller, pattern) {
  return { type: 'cc', controller, pattern }
}

exports.rev = rev
function rev (pattern) {
  return helpers.modifyObj(pattern, pattern => {
    pattern.values[0] = helpers.reverseArray(pattern.values[0])
    pattern.values[1] = helpers.reverseArray(pattern.values[1])
  })
}

exports.jux = jux
function jux (f, pattern) {
  const clone = f(helpers.cloneObj(pattern))
  return helpers.modifyObj(pattern, pattern => {
    pattern.values[0] = pattern.values[0]
    pattern.values[1] = clone.values[1]
  })
}

exports.every = every
function every (n, f, pattern) {
  const clone = f(helpers.cloneObj(pattern))
  return helpers.modifyObj(pattern, pattern => {
    pattern.values[0] = helpers.repeatArray(n - 1, pattern.values[0]).concat(clone.values[0])
    pattern.values[1] = helpers.repeatArray(n - 1, pattern.values[1]).concat(clone.values[1])
    pattern.cycles *= n
  })
}

exports.chop = chop
function chop (ns, pattern) {
  // TODO
  return pattern
}
