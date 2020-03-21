const { reverseArray, repeatArray, cloneObj, cloneArray, modifyObj } = require('../common/helpers')

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
  return modifyObj(this, f)
}

Pattern.prototype.toString = function () {
  const values = this.values.map(values => `\n  ${JSON.stringify(values)}`)
  return `pattern (${this.cycles})${values}`
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
    pattern.cycles *= n
  })
}
