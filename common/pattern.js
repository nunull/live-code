module.exports = Pattern

function Pattern (value, cycles = 1, category = "notes") {
  // this.values = {}
  // this.values[category] = [value, value]
  this.values = [value, value]
  this.cycles = cycles
}

Pattern.prototype.clone = function () {
  const clone = new Pattern()
  clone.values = cloneArray(this.values)
  // clone.values = cloneObj(this.values)
  clone.cycles = this.cycles
  return clone
}

Pattern.prototype.modify = function (f) {
  const clone = this.clone()
  f(clone)
  return clone
}

Pattern.prototype.toString = function () {
  return `pattern (${this.cycles})\n  ${JSON.stringify(this.values[0])}\n  ${JSON.stringify(this.values[1])}`
}

Pattern.prototype.rev = function () {
  return this.modify(pattern => {
    pattern.values[0] = reverseArray(pattern.values[0])
    pattern.values[1] = reverseArray(pattern.values[1])
  })
}

Pattern.prototype.jux = function (f) {
  const clone = f(this.clone())
  return this.modify(pattern => {
    pattern.values[0] = pattern.values[0]
    pattern.values[1] = clone.values[1]
  })
}

Pattern.prototype.every = function (n, f) {
  const clone = f(this.clone())
  return this.modify(pattern => {
    pattern.values[0] = repeatArray(n - 1, pattern.values[0]).concat(clone.values[0])
    pattern.values[1] = repeatArray(n - 1, pattern.values[1]).concat(clone.values[1])
  })
}

function reverseArray (a) {
  return a.slice().reverse().map(i => Array.isArray(i) ? reverseArray(i) : i)
}

function repeatArray (n, a) {
    let result = []
    for (let i = 0; i <= n; i++) result = result.concat(a)
    return result
}

function cloneObj (obj) {
  const result = {}
  for (const key in obj) {
    const value = obj[key]
    if (Array.isArray(value)) result[key] = cloneArray(value)
    else if (typeof value === 'object') result[key] = cloneObj(value)
    else result[key] = value
  }
  return result
}

function cloneArray (a) {
  const result = []
  for (const item of a) {
    result.push(Array.isArray(item) ? cloneArray(item) : item)
  }
  return result
}
