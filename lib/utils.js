const convertStringToDate = (string) => { // expects date in format [YYYY-MM-DD-HH-MM]
  let stringArray = string.split('-')
  return new Date(stringArray[0], Number(stringArray[1]) - 1, stringArray[2], stringArray[3], stringArray[4])
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
  return number >= 10 ? '' + number : '0' + number
}

const isDateValid = (date) => {
  return date instanceof Date && !isNaN(date)
}

const messageType = {
  INFO: '[INFO] ',
  ERROR: '[ERROR] ',
  WARNING: '[WARNING] ',
  SIMPLE: '',
}
const fprint = (message, type = messageType.SIMPLE) => {
  return console.log(type + message)
}

const createTable = ({ header = [], content = [], footer = [] }) => {
  const colLengths = []
  let main = Math.max(header.length, content.length, footer.length)
  for (let i = 0; i < main; i++) {
    let h = 0
    let c = 0
    let f = 0
    if (header.length > i) {
      h = header[i].toString().length
    }
    if (content.length > i) {
      for (let j = 0; j < content.length; j++) {
        c = Math.max(c, content[j][i].toString().length)
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
  // TODO: custom footer, maybe sums?
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
  secondsToTimeIntervals,
}
