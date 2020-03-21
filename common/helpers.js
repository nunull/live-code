exports.reverseArray = reverseArray

function reverseArray (a) {
  return a.slice().reverse().map(i => Array.isArray(i) ? reverseArray(i) : i)
}

exports.repeatArray = repeatArray

function repeatArray (n, a) {
    let result = []
    for (let i = 0; i < n; i++) result = result.concat(a)
    return result
}

exports.cloneObj = cloneObj

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

exports.cloneArray = cloneArray

function cloneArray (a) {
  const result = []
  for (const item of a) {
    result.push(Array.isArray(item) ? cloneArray(item) : item)
  }
  return result
}

exports.modifyObj = modifyObj

function modifyObj (obj, f) {
  const clone = obj.clone()
  f(clone)
  return clone
}
