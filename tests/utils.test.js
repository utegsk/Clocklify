const {
  fillWith,
  isDateValid,
  isDateBefore,
  secondsToTimeIntervals,
  parseProvidedTime,
  convertStringToDate,
  formatTimeString,
} = require('../lib/utils')


describe('fillWith func test', () => {

  test('should fill with correct sign', () => {
    expect(fillWith('Hi, I am a string', 20, '*')).toBe('*Hi, I am a string****')
    expect(fillWith('Hi there!', 15)).toBe(' Hi there!       ')
  })

  test('is of shorter or equal length, should add max 1 on sides', () => {
    const greeting = 'Ahoj!'
    expect(fillWith(greeting, 3)).toBe(' ' + greeting)
    expect(fillWith(greeting, 5, '*')).toBe('*' + greeting + '*')
  })

})

describe('date func tests', () => {

  test('isDateValid', () => {
    expect(isDateValid(new Date())).toBeTruthy()
    expect(isDateValid(new Date().toISOString())).toBeFalsy()
    expect(isDateValid(new Date().getTime())).toBeFalsy()
    expect(isDateValid(null)).toBeFalsy()
  })

  test('isDateBefore', () => {
    const former = new Date()
    const later = new Date(new Date().setFullYear(new Date().getFullYear() + 1))
    expect(isDateBefore(former, former)).toBeFalsy()
    expect(isDateBefore(former, null)).toBeFalsy()
    expect(isDateBefore(null, null)).toBeFalsy()
    expect(isDateBefore(null, former)).toBeFalsy()
    expect(isDateBefore(null, former)).toBeFalsy()
    expect(isDateBefore(later, former)).toBeFalsy()
    expect(isDateBefore(later, later)).toBeFalsy()
    expect(isDateBefore(former, later)).toBeTruthy()
  })

  test('secondsToTimeIntervals', () => {
    expect(secondsToTimeIntervals(100)).toEqual({ seconds: 40, minutes: 1, hours: 0, days: 0 })
    expect(secondsToTimeIntervals(0)).toEqual({ seconds: 0, minutes: 0, hours: 0, days: 0 })
    expect(secondsToTimeIntervals(1000)).toEqual({ seconds: 40, minutes: 16, hours: 0, days: 0 })
    expect(secondsToTimeIntervals(123456789)).toEqual({ seconds: 9, minutes: 33, hours: 21, days: 1428 })
  })

  test('parseProvidedTime', () => {
    expect(parseProvidedTime('14:00')).toEqual({ hour: '14', minute: '00' })
    expect(parseProvidedTime('10:55')).toEqual({ hour: '10', minute: '55' })
    expect(parseProvidedTime('0:05')).toEqual({ hour: '0', minute: '05' })
  })

  test('convertStringToDate', () => {
    expect(convertStringToDate('1010-10-10-10-10').getMonth()).toBe(9)
    expect(convertStringToDate('1010-10-10-11-10').getHours()).toBe(11)
    expect(convertStringToDate('1010-10-10-10-10').getMilliseconds()).toBe(0)
    expect(convertStringToDate('1010-10-10-10-00').getMinutes()).toBe(0)
  })

  test('formatTimeString', () => {
    expect(formatTimeString('format me')).toBe('me')
    expect(formatTimeString(1234)).toBe('34')
  })

})
