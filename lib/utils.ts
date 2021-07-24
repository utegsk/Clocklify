const chalk = require('chalk');

const convertStringToDate = (string) => { // expects date in format [YYYY-MM-DD-HH-MM]
  try {
    let stringArray = string.split('-')
    return new Date(stringArray[0], Number(stringArray[1]) - 1, stringArray[2], stringArray[3], stringArray[4])
  } catch (error) {
    return null;
  }
}

const parseDateFromTimeEntry = (time) => { // expects time entry in format [HH:MM:SS]
  if (time) {
    const now = new Date();
    const regex = /\d{1,2}:\d{1,2}:?\d{0,2}/
    if (regex.test(time)) {
      const [hours, minutes, seconds] = time.split(':')
      now.setHours(parseInt(hours))
      now.setMinutes(parseInt(minutes))
      now.setSeconds(seconds ? parseInt(seconds) : 0)
      return now
    }
  }
  return null
}

const parseProvidedTime = (timeString) => { // '14:00' -> { hour: 14, minute: 0 }
  let [hour, minute] = timeString.split(':')
  return { hour, minute }
}

const secondsToTimeIntervals = duration => {
  const seconds = Math.floor((duration) % 60)
  const minutes = Math.floor((duration / 60) % 60)
  const hours = Math.floor((duration / (60 * 60)) % 24)
  const days = Math.floor((duration / ((60 * 60 * 24))))
  return {
    seconds,
    minutes,
    hours,
    days
  }
}

const formatTimeString = (number) => {
  return ('0' + number).slice(-2)
}

const isDateValid = (date) => {
  return date instanceof Date && !isNaN(date)
}
const isDateBefore = (former, later) => {
  return isDateValid(former) && isDateValid(later) && former.getTime() < later.getTime()
}

const messageType = {
  INFO: '[INFO] ',
  ERROR: '[ERROR] ',
  WARNING: '[WARNING] ',
  SIMPLE: '',
}

const fprint = (message, type = messageType.SIMPLE) => {
  switch (type) {
    case messageType.INFO:
      return console.log(chalk.blue(type) + message)
    case messageType.ERROR:
      return console.log(chalk.red(type) + message)
    case messageType.WARNING:
      return console.log(chalk.yellow(type) + message)
    default:
      return console.log(type + message)
  }
}

const createTable = ({ header = [], content = [], footer = [] }) => {
  const colLengths = []
  let main = Math.max(header.length, content.length ? content[0].length : [], footer.length)
  for (let i = 0; i < main; i++) {
    let h = 0
    let c = 0
    let f = 0
    if (header.length > i) {
      h = header[i].toString().length
    }
    if (content.length > i) {
      for (let j = 0; j < content.length; j++) {
        c = Math.max(c, content[j][i] ? content[j][i].toString().length : 0)
      }
    }
    if (footer.length > i) {
      f = footer[i].toString().length
    }
    colLengths.push(Math.max(h, c, f))
  }

  let divider = '|'
  let headerLine = '|'
  for (let i = 0; i < colLengths.length; i++) {
    divider += fillWith('', colLengths[i], '-') + (i + 1 < colLengths.length ? '+' : '|')
    headerLine += fillWith(header[i], colLengths[i], ' ') + '|'
  }
  let dividerWithCorners = '+' + divider.substr(1, divider.length - 2) + '+'


  fprint(dividerWithCorners, messageType.SIMPLE)
  fprint(headerLine, messageType.SIMPLE)
  fprint(divider, messageType.SIMPLE)

  for (let j = 0; j < content.length; j++) {
    let contentLine = '|'
    for (let k = 0; k < colLengths.length; k++) {
      contentLine += fillWith(content[j][k], colLengths[k], ' ') + '|'
    }
    fprint(divider, messageType.SIMPLE)
    fprint(contentLine, messageType.SIMPLE)
  }
  if (footer.length) {
    fprint(divider, messageType.SIMPLE)
    fprint(divider, messageType.SIMPLE)
    let footerLine = "|"
    for (let k = 0; k < colLengths.length; k++) {
      footerLine += fillWith(footer[k], colLengths[k], ' ') + '|'
    }
    fprint(footerLine, messageType.SIMPLE)
  }
  fprint(dividerWithCorners, messageType.SIMPLE)
}

const fillWith = (text = '', length = 0, sign = ' ') => {
  let temp = sign + text
  for (let i = temp.length; i <= length + 1; i++) {
    temp += sign
  }
  return temp
}

module.exports = {
  messageType,
  fprint,
  formatTimeString,
  parseProvidedTime,
  convertStringToDate,
  createTable,
  isDateValid,
  isDateBefore,
  secondsToTimeIntervals,
  parseDateFromTimeEntry,
  fillWith,
}
