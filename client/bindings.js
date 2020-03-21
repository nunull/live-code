const helpers = require('./helpers')

exports.n = pattern => ({ type: 'notes', pattern })

exports.cc = (controller, pattern) => ({ type: 'cc', controller, pattern })

exports.rev = pattern => {
  return helpers.modifyObj(pattern, pattern => {
    pattern.values[0] = helpers.reverseArray(pattern.values[0])
    pattern.values[1] = helpers.reverseArray(pattern.values[1])
  })
}

exports.jux = (f, pattern) => {
  const clone = f(helpers.cloneObj(pattern))
  return helpers.modifyObj(pattern, pattern => {
    pattern.values[0] = pattern.values[0]
    pattern.values[1] = clone.values[1]
  })
}

exports.every = (n, f, pattern) => {
  const clone = f(helpers.cloneObj(pattern))
  return helpers.modifyObj(pattern, pattern => {
    pattern.values[0] = helpers.repeatArray(n - 1, pattern.values[0]).concat(clone.values[0])
    pattern.values[1] = helpers.repeatArray(n - 1, pattern.values[1]).concat(clone.values[1])
    pattern.cycles *= n
  })
}

// TODO
exports.chop = (ns, pattern) => pattern
