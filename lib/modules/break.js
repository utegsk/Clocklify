const mainPackage = require('../../package.json')
const messages = require('../messages.json')
const configStore = require('configstore')
const credentials = new configStore(mainPackage.name)
const utils = require('../utils')


const start = () => {
  let work = credentials.get('work')
  if (work) {
    if (!work.lunchStart) {
      let now = new Date()
      credentials.set('work', { ...work, lunchStart: now.toUTCString() })
      utils.fprint(messages.START_BREAK + ' at ' + now.toLocaleTimeString(), utils.messageType.INFO)
      // TODO: place for Slack and Github api call
    } else {
      utils.fprint(messages.NO_BREAK_IN_PROGRESS, utils.messageType.ERROR)
    }
  } else {
    utils.fprint(messages.NO_WORK_IN_PROGRESS, utils.messageType.WARNING)
  }
}

const stop = () => {
  let work = credentials.get('work')
  if (work) {
    if (work.lunchStart) {
      if (!work.lunchEnd) {
        let now = new Date()
        credentials.set('work', { ...work, lunchEnd: now.toUTCString() })
        utils.fprint(messages.STOP_BREAK + ' at ' + now.toLocaleTimeString(), utils.messageType.INFO)
        // TODO: place for Slack and Github api call
      } else {
        utils.fprint(messages.STOP_BREAK_FAILED, utils.messageType.ERROR)
      }
    } else {
      utils.fprint(messages.NO_BREAK_IN_PROGRESS, utils.messageType.WARNING)
    }
  } else {
    utils.fprint(messages.NO_WORK_IN_PROGRESS, utils.messageType.WARNING)
  }
}

module.exports = {
  start,  // starts a break and changes working status on Slack/Github to "Lunch Time"
  stop,    // ends the running break and changes working status back to "Busy"
}
