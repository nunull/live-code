const language = require('./language')

describe('pattern()', () => {
  test('matches a simple pattern of numbers', () => {
    const tokens = [{ value: '0' }, { value: '1' }, { value: '2.5' }]
    expect(language.pattern(tokens)).toEqual([0, 1, 2.5])
    expect(tokens).toEqual([])
  })

  test('matches a pattern of mixed numbers and identifiers', () => {
    const tokens = [{ value: '0' }, { value: 'a' }, { value: '2.5' }]
    expect(language.pattern(tokens)).toEqual([0, 'a', 2.5])
    expect(tokens).toEqual([])
  })

  test('matches subpatterns', () => {
    const tokens = [{ value: '0' }, { value: '1' }, { value: '[' },
      { value: '2.5' }, { value: 'a' }, { value: ']' }]

    expect(language.pattern(tokens)).toEqual([0, 1, [2.5, 'a']])
    expect(tokens).toEqual([])
  })

  test('matches nested subpatterns', () => {
    const tokens = [{ value: '0' }, { value: '1' }, { value: '[' },
      { value: '2.5' }, { value: 'a' }, { value: '[' }, { value: 'b' },
      { value: 'c' }, { value: ']' }, { value: ']' }]

    expect(language.pattern(tokens)).toEqual([0, 1, [2.5, 'a', ['b', 'c']]])
    expect(tokens).toEqual([])
  })

  test('does not match imbalanced brackets', () => {
    const tokens = [{ value: '0' }, { value: '1' }, { value: '[' },
      { value: '2.5' }, { value: 'a' }]

    expect(language.pattern(tokens)).toEqual([0, 1])
    expect(tokens).toEqual([{ value: '[' }, { value: '2.5' }, { value: 'a' }])
  })
})

describe('quotedPattern()', () => {
  test('matches a pattern in double quotes', () => {
    const tokens = [{ value: '"' }, { value: '0' }, { value: '1' },
      { value: '[' }, { value: '2.5' }, { value: 'a' }, { value: ']' },
      { value: '"' }]

    expect(language.quotedPattern(tokens))
      .toEqual({ type: 'pattern', value: [0, 1, [2.5, 'a']] })
    expect(tokens).toEqual([])
  })

  test('does not match imbalanced double quotes', () => {
    const tokens = [{ value: '"' }, { value: '0' }, { value: '1' },
      { value: '[' }, { value: '2.5' }, { value: 'a' }, { value: ']' }]

    expect(() => language.quotedPattern(tokens)).toThrow()
    expect(tokens).toEqual([{ value: '"' }, { value: '0' }, { value: '1' },
      { value: '[' }, { value: '2.5' }, { value: 'a' }, { value: ']' }])
  })
})

describe('parameters()', () => {
  test('matches a number', () => {
    const tokens = [{ value: '1' }]

    expect(language.parameters(tokens)).toEqual([{ type: 'value', value: 1 }])
    expect(tokens).toEqual([])
  })

  test('matches a pattern', () => {
    const tokens = [{ value: '"'}, { value: '1' }, { value: '2' }, { value: '"'}]

    expect(language.parameters(tokens)).toEqual([{ type: 'pattern', value: [1, 2] }])
    expect(tokens).toEqual([])
  })

  test('matches an identifier', () => {
    const tokens = [{ value: 'abc' }]

    expect(language.parameters(tokens)).toEqual([{ type: 'identifier', value: 'abc' }])
    expect(tokens).toEqual([])
  })

  test('matches a simple piped expression', () => {
    const tokens = [{ value: '('}, { value: 'rev' }, { value: ')' }]

    expect(language.parameters(tokens)).toEqual([{
      type: 'pipedExpression', value: [{
        type: 'functionCall', name: 'rev', params: []
      }]
    }])
    expect(tokens).toEqual([])
  })

  test('matches a complex piped expression', () => {
    const tokens = [{ value: '('}, { value: 'rev' }, { value: '1' },
      { value: '|' }, { value: 'abc' }, { value: ')' }]

    expect(language.parameters(tokens)).toEqual([{
      type: 'pipedExpression', value: [{
        type: 'functionCall', name: 'rev', params: [{ type: 'value', value: 1 }]
      }, {
        type: 'functionCall', name: 'abc', params: []
      }]
    }])
    expect(tokens).toEqual([])
  })

  test('matches multiple different parameters', () => {
    const tokens = [{ value: '1' }, { value: '('}, { value: 'rev' },
      { value: '1' }, { value: '|' }, { value: 'abc' }, { value: ')' },
      { value: '"' }, { value: '1' }, { value: '2' }, { value: '[' },
      { value: '3' }, { value: '4' }, { value: ']' }, { value: '"' }]

    expect(language.parameters(tokens)).toEqual([{
      type: 'value', value: 1
    }, {
      type: 'pipedExpression', value: [{
        type: 'functionCall', name: 'rev', params: [{ type: 'value', value: 1 }]
      }, {
        type: 'functionCall', name: 'abc', params: []
      }]
    }, {
      type: 'pattern',
      value: [1, 2, [3, 4]]
    }])
    expect(tokens).toEqual([])
  })
})

describe('functionCall()', () => {
  test('matches an identifier', () => {
    const tokens = [{ value: 'abc' }]

    expect(language.functionCall(tokens)).toEqual({
      type: 'functionCall', name: 'abc', params: [] })
    expect(tokens).toEqual([])
  })

  test('matches an identifier and params', () => {
    const tokens = [{ value: 'abc' }, { value: '1' }, { value: '2.3' }]

    expect(language.functionCall(tokens)).toEqual({
      type: 'functionCall', name: 'abc', params: [{
        type: 'value', value: 1
      }, {
        type: 'value', value: 2.3
      }]
    })
    expect(tokens).toEqual([])
  })
})

describe('pipedExpression()', () => {
  test('matches an identifier', () => {
    const tokens = [{ value: 'abc' }]

    expect(language.pipedExpression(tokens)).toEqual({
      type: 'pipedExpression', value: [{
        type: 'functionCall', name: 'abc', params: [] }
    ]})
    expect(tokens).toEqual([])
  })

  test('matches an identifier and params', () => {
    const tokens = [{ value: 'abc' }, { value: '1' }, { value: '2.3' }]

    expect(language.pipedExpression(tokens)).toEqual({
      type: 'pipedExpression', value: [{
        type: 'functionCall', name: 'abc', params: [{
          type: 'value', value: 1
        }, {
          type: 'value', value: 2.3
        }]
      }]
    })
    expect(tokens).toEqual([])
  })

  test('matches multiple piped function calls', () => {
    const tokens = [{ value: 'abc' }, { value: '1' }, { value: '2.3' },
      { value: '|' }, { value: 'def' }, { value: '"' }, { value: '1' },
      { value: '2' }, { value: '"' }]

    expect(language.pipedExpression(tokens)).toEqual({
      type: 'pipedExpression', value: [{
        type: 'functionCall', name: 'abc', params: [{
          type: 'value', value: 1
        }, {
          type: 'value', value: 2.3
        }]
      }, {
        type: 'functionCall', name: 'def', params: [{
          type: 'pattern', value: [1, 2]
        }]
      }]
    })
    expect(tokens).toEqual([])
  })
})

describe('plusExpression()', () => {
  test('matches an identifier', () => {
    const tokens = [{ value: 'abc' }]

    expect(language.plusExpression(tokens)).toEqual({
      type: 'plusExpression', value: [{
        type: 'pipedExpression', value: [{
          type: 'functionCall', name: 'abc', params: []
        }]
      }]})
    expect(tokens).toEqual([])
  })

  test('matches multiple expressions', () => {
    const tokens = [{ value: 'abc' }, { value: '|' }, { value: 'def' },
      { value: '2' }, { value: '+' }, { value: 'abc' }]

    expect(language.plusExpression(tokens)).toEqual({
      type: 'plusExpression', value: [{
        type: 'pipedExpression', value: [{
          type: 'functionCall', name: 'abc', params: []
        }, {
          type: 'functionCall', name: 'def', params: [{ type: 'value', value: 2 }]
        }]
      }, {
        type: 'pipedExpression', value: [{
          type: 'functionCall', name: 'abc', params: []
        }]
      }]})
    expect(tokens).toEqual([])
  })
})

describe('assignment()', () => {
  test('matches a simple assignment', () => {
    const tokens = [{ value: '1' }, { value: '=' }, { value: 'abc' }]
    expect(language.assignment(tokens)).toEqual({
      type: 'assignment', id: '1', value: {
        type: 'plusExpression',
        value: [{
          type: 'pipedExpression',
          value: [{
            type: 'functionCall',
            name: 'abc',
            params: []
          }]
        }]
      }
    })
    expect(tokens).toEqual([])
  })
})

describe('script()', () => {
  test('matches a simple assignment', () => {
    const tokens = [{ value: '1' }, { value: '=' }, { value: 'abc' }]

    expect(language.script(tokens)).toEqual({
      type: 'script', value: [{
        type: 'assignment', id: '1', value: {
          type: 'plusExpression',
          value: [{
            type: 'pipedExpression',
            value: [{
              type: 'functionCall',
              name: 'abc',
              params: []
            }]
          }]
        }
      }]
    })
    expect(tokens).toEqual([])
  })

  test('matches multiple assignments', () => {
    const tokens = [{ value: '1' }, { value: '=' }, { value: 'abc' },
      { value: '\n' }, { value: '2' }, { value: '=' }, { value: 'def' },]

    expect(language.script(tokens)).toEqual({
      type: 'script', value: [{
        type: 'assignment', id: '1', value: {
          type: 'plusExpression',
          value: [{
            type: 'pipedExpression',
            value: [{
              type: 'functionCall',
              name: 'abc',
              params: []
            }]
          }]
        }
      }, {
        type: 'assignment', id: '2', value: {
          type: 'plusExpression',
          value: [{
            type: 'pipedExpression',
            value: [{
              type: 'functionCall',
              name: 'def',
              params: []
            }]
          }]
        }
      }]
    })
    expect(tokens).toEqual([])
  })
})
