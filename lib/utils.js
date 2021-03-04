const convertStringToDate = (string) => { // expects date in format [YYYY-MM-DD-HH-MM]
  let stringArray = string.split('-')
  return new Date(stringArray[0], Number(stringArray[1]) - 1, stringArray[2], stringArray[3], stringArray[4])
}

const parseProvidedTime = (timeString) => { // '14:00' -> { hour: 14, minute: 0 }
  let [hour, minute] = timeString.split(':')
  return { hour, minute }
}

const formatTimeString = (number) => {
  return number >= 10 ? '' + number : '0' + number
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
      for (let j of content) {
        c = Math.max(c, footer[j].toString().length)
      }
    }
    if (footer.length > i) {
      f = footer[i].toString().length
    }
    colLengths.push(Math.max(h, c, f))
  }

  let divider = '+'
  let headerLine = '+'
  // TODO: custom header
  for (let i=0; i < colLengths.length; i++) {
    divider += fillWith('', colLengths[i], '-')
    headerLine += fillWith(header[i], colLengths[i], ' ') + '+'
  }
  fprint(divider, messageType.SIMPLE)
  fprint(headerLine, messageType.SIMPLE)
  fprint(divider, messageType.SIMPLE)

  for(let j=0; j < content.length; j++ ) {
    let contentLine = '|'
    for (let k = 0; k < colLengths.length; k++) {
      contentLine += fillWith(content[j][k], colLengths[k], ' ') + '|'
    }
    fprint(contentLine, messageType.SIMPLE)
    fprint(divider, messageType.SIMPLE)
  }

  // TODO: custom footer
}

const fillWith = (text = '', length = 0, sign = ' ') => {
  let temp = sign + text
  for (let i = temp.length; i <= length; i++) {
    temp.concat(sign)
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
}
