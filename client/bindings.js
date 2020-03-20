exports.n = pattern => pattern

exports.rev = pattern => pattern.rev()

exports.jux = (f, pattern) => pattern.jux(f)

exports.every = (n, f, pattern) => pattern.every(n, f)

// TODO
exports.chop = (ns, pattern) => pattern
