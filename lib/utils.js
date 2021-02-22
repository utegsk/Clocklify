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

module.exports = {
  messageType,
  fprint,
  formatTimeString,
  parseProvidedTime,
  convertStringToDate,
}
