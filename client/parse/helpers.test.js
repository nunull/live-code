const base = require('./base')
const helpers = require('./helpers')

describe('many()', () => {
  test('consumes the first matching token', () => {
    const tokens = [{ value: 'abc' }, { value: 'def' }]
    const result = helpers.many(tokens, tokens => base.literal(tokens, 'abc'))

    expect(result).toEqual([{ value: 'abc' }])
    expect(tokens).toEqual([{ value: 'def' }])
  })

  test('consumes all matching token', () => {
    const tokens = [{ value: 'abc' }, { value: 'abc' }]
    const result = helpers.many(tokens, tokens => base.literal(tokens, 'abc'))

    expect(result).toEqual([{ value: 'abc' }, { value: 'abc' }])
    expect(tokens).toEqual([])
  })

  test('consumes no matching token', () => {
    const tokens = [{ value: 'abc' }, { value: 'abc' }]
    const result = helpers.many(tokens, tokens => base.literal(tokens, 'def'))

    expect(result).toEqual([])
    expect(tokens).toEqual([{ value: 'abc' }, { value: 'abc' }])
  })
})

describe('surroundedBy()', () => {
  test('consumes a literal surrounded by ()', () => {
    const tokens = [{ value: '(' }, { value: 'abc' }, { value: ')' }]
    const result = helpers.surroundedBy(tokens, '(', ')', tokens =>
      base.literal(tokens, 'abc'))

    expect(result).toEqual({ value: 'abc' })
    expect(tokens).toEqual([])
  })

  test('cosumes a literal surrounded by (())', () => {
    const tokens = [{ value: '(' }, { value: '(' }, { value: 'abc' },
      { value: ')' }, { value: ')' }]
    const result = helpers.surroundedBy(tokens, '(', ')', tokens =>
      helpers.surroundedBy(tokens, '(', ')', tokens =>
        base.literal(tokens, 'abc')))

    expect(result).toEqual({ value: 'abc' })
    expect(tokens).toEqual([])
  })

  test('does not consumes a literal surrounded by wrong tokens', () => {
    const tokens = [{ value: '(' }, { value: 'abc' }, { value: ')' }]
    const result = () => helpers.surroundedBy(tokens, '"', '"', tokens =>
      base.literal(tokens, 'abc'))

    expect(result).toThrow()
    expect(tokens).toEqual([{ value: '(' }, { value: 'abc' }, { value: ')' }])
  })

  test('does unshift correctly if f() is not matched', () => {
    const tokens = [{ value: '(' }, { value: 'def' }]
    const result = () => helpers.surroundedBy(tokens, '(', ')', tokens =>
      base.literal(tokens, 'abc'))

    expect(result).toThrow()
    expect(tokens).toEqual([{ value: '(' }, { value: 'def' }])
  })

  test('does unshift correctly if ending token is not matched', () => {
    const tokens = [{ value: '(' }, { value: 'abc' }]
    const result = () => helpers.surroundedBy(tokens, '(', ')', tokens =>
      base.literal(tokens, 'abc'))

    expect(result).toThrow()
    expect(tokens).toEqual([{ value: '(' }, { value: 'abc' }])
  })
})

describe('optional()', () => {
  test('consumes a literal', () => {
    const tokens = [{ value: 'abc' }]
    const [err, result] = helpers.optional(tokens, tokens =>
      base.literal(tokens, 'abc'))

    expect(err).toBeFalsy()
    expect(result).toEqual({ value: 'abc' })
    expect(tokens).toEqual([])
  })

  test('does not consume a non-matching token', () => {
    const tokens = [{ value: 'abc' }]
    const [err, result] = helpers.optional(tokens, tokens =>
      base.literal(tokens, 'def'))

    expect(err).toBeTruthy()
    expect(result).toBeFalsy()
    expect(tokens).toEqual([{ value: 'abc' }])
  })
})

describe('readdLostTokens()', () => {
  test('re-adds lost tokens', () => {
    const tokens = [{ value: 'def' }]
    const tokensCopy = [{ value: 'abc' }, { value: 'def' }]

    helpers.readdLostTokens(tokens, tokensCopy)
    expect(tokens).toEqual([{ value: 'abc' }, { value: 'def' }])
  })

  test('does not change tokens if it has not changed', () => {
    const tokens = [{ value: 'abc' }, { value: 'def' }]
    const tokensCopy = [{ value: 'abc' }, { value: 'def' }]

    helpers.readdLostTokens(tokens, tokensCopy)
    expect(tokens).toEqual([{ value: 'abc' }, { value: 'def' }])
  })
})

describe('skipNewlines()', () => {
  test('skips multiple newlines', () => {
    const tokens = [{ value: '\n' }, { value: '\n' }, { value: '\n' },
      { value: 'abc' }]

    helpers.skipNewlines(tokens)
    expect(tokens).toEqual([{ value: 'abc' }])
  })
})
