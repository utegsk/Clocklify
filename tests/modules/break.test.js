const { start, stop } = require('../../lib/modules/break')
const { get: getFromStorage, set: setToStorage } = require('../../lib/storage')


describe('toggle break basics', () => {
  let credentialsMem;

  beforeAll(() => {
    credentialsMem = getFromStorage('break')
  })

  beforeEach(() => {
    setToStorage('break', { total: 0, startAt: null })
  })

  test('should be 0 with no start', () => {
    expect(getFromStorage('break').total).toBe(0)
    expect(getFromStorage('break').startAt).toBeNull()
  })

  test('should start break', () => {
    start(getFromStorage('break'))
    expect(getFromStorage('break').total).toBe(0)
    expect(getFromStorage('break').startAt).not.toBeNull()
  })

  test('should stop ongoing break', () => {
    start(getFromStorage('break'))
    stop(getFromStorage('break'))
    expect(getFromStorage('break').startAt).toBe(null)
  })

  afterAll(() => {
    setToStorage('break', credentialsMem)
  })

})

describe('break lifecycle', () => {
  let credentialsMem;

  beforeAll(() => {
    credentialsMem = getFromStorage('break')
    setToStorage('break', { total: 0, startAt: null })
  })

  test('should start first break',() => {
    start(getFromStorage('break'))
    expect(getFromStorage('break').total).toBe(0)
    expect(getFromStorage('break').startAt).not.toBe(null)
  })

  test('should stop first break',() => {
    stop(getFromStorage('break'))
    expect(getFromStorage('break').total).toBeGreaterThan(0)
    expect(getFromStorage('break').startAt).toBe(null)
  })

  test('should start second break',() => {
    start(getFromStorage('break'))
    expect(getFromStorage('break').total).toBeGreaterThan(0)
    expect(getFromStorage('break').startAt).not.toBe(null)
  })

  test('should stop second break', () => {
    const previousTotal = getFromStorage('break').total
    stop(getFromStorage('break'))
    expect(getFromStorage('break').total).toBeGreaterThan(previousTotal)
    expect(getFromStorage('break').total).toBeGreaterThan(0)
    expect(getFromStorage('break').startAt).toBe(null)
  })

  afterAll(() => {
    setToStorage('break', credentialsMem)
  })

})

