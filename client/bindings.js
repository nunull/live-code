exports.n = pattern => ({ type: 'notes', pattern })

exports.cc = (controller, pattern) => ({ type: 'cc', controller, pattern })

exports.rev = pattern => pattern.rev()

exports.jux = (f, pattern) => pattern.jux(f)

exports.every = (n, f, pattern) => pattern.every(n, f)

// TODO
exports.chop = (ns, pattern) => pattern
