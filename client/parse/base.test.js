const base = require('./base')

describe('match()', () => {
  test('matches the first token', () => {
    const tokens = [{ value: 'abc' }]
    expect(base.match(tokens, /^abc$/)).toEqual('abc')
  })

  test('throws when it does not match the first token', () => {
    const tokens = [{ value: 'def' }]
    expect(() => base.match(tokens, /^abc$/)).toThrow()
  })
})

describe('identifier()', () => {
  test('accepts lowercase', () => {
    const tokens = [{ value: 'abc' }]
    expect(base.identifier(tokens)).toEqual({ type: 'identifier', value: 'abc' })
  })

  test('accepts uppercase', () => {
    const tokens = [{ value: 'ABC' }]
    expect(base.identifier(tokens)).toEqual({ type: 'identifier', value: 'ABC' })
  })

  test('accepts numbers', () => {
    const tokens = [{ value: '1' }]
    expect(base.identifier(tokens)).toEqual({ type: 'identifier', value: '1' })
  })

  test('does not accept underscores', () => {
    const tokens = [{ value: 'abc_def' }]
    expect(() => base.identifier(tokens)).toThrow()
  })

  test('does not accept equals sign', () => {
    const tokens = [{ value: '=' }]
    expect(() => base.identifier(tokens)).toThrow()
  })
})

describe('number()', () => {
  test('accepts integers', () => {
    const tokens = [{ value: '123' }]
    expect(base.number(tokens)).toEqual({ type: 'value', value: 123 })
  })

  test('accepts floats', () => {
    const tokens = [{ value: '123.123' }]
    expect(base.number(tokens)).toEqual({ type: 'value', value: 123.123 })
  })

  test('does not accept strings', () => {
    const tokens = [{ value: 'abc' }]
    expect(() => base.number(tokens)).toThrow()
  })
})

describe('literal()', () => {
  test('matches "123"', () => {
    const tokens = [{ value: '123' }]
    expect(base.literal(tokens, '123')).toEqual({ value: '123' })
  })

  test('matches "abc"', () => {
    const tokens = [{ value: 'abc' }]
    expect(base.literal(tokens, 'abc')).toEqual({ value: 'abc' })
  })

  test('does not accept different value', () => {
    const tokens = [{ value: 'abc' }]
    expect(() => base.literal(tokens, 'def')).toThrow()
  })
})
