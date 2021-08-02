const mainPackage = require('../../package.json')
const messages = require('../messages.json')
const configStore = require('configstore')
const credentials = new configStore(mainPackage.name)
const utils = require('../utils')


const start = (_break) => {
  const now = new Date()
  credentials.set('break', { ..._break, startAt: now })
  utils.fprint(messages.START_BREAK + ' at ' + now.toLocaleTimeString(), utils.messageType.INFO)
  // TODO: place for Slack and Github api call
}

const stop = (_break) => {
  const now = new Date()
  const currentBreakLength = Date.parse(now) - Date.parse(_break.startAt)
  credentials.set('break', { ..._break, total: _break.total + currentBreakLength, startAt: null })
  utils.fprint(messages.STOP_BREAK + ' at ' + now.toLocaleTimeString(), utils.messageType.INFO)
  // TODO: place for Slack and Github api call
}

export default {
  start,  // starts a break and changes working status on Slack/Github to "Lunch Time"
  stop,    // ends the running break and changes working status back to "Busy"
}
