const messages = require('../messages.json')
const { get: getFromStorage, set: setToStorage, remove: removeFromStorage } = require('../storage')
const utils = require('../utils.js')
const chalk = require('chalk');
const questions = require('../questions.js')
const clockify = require('../clockify.js')
const goal = require('./goal')


const workLengthString = (startDate, endDate = new Date().toString()) => {
  if (!startDate) {
    utils.fprint(messages.START_DATE_MISSING, utils.messageType.ERROR)
    return
  }
  const difference = (Date.parse(new Date(endDate)) - Date.parse(new Date(startDate))) - (getFromStorage('break') ? getFromStorage('break').total : 0)
  const { seconds, minutes, hours, days } = utils.secondsToTimeIntervals(difference / 1e3)
  return `${utils.formatTimeString(days)} : ${utils.formatTimeString(hours)} : ${utils.formatTimeString(minutes)} : ${utils.formatTimeString(seconds)}`
}

const start = (startDate) => {
  let work = getFromStorage('work')
  if (!work) {
    setToStorage('work', { startDate: startDate.toUTCString() })
    setToStorage('break', { total: 0, startAt: null })
    utils.fprint(messages.WORK_HAS_STARTED + ' at ' + startDate.toLocaleTimeString(), utils.messageType.INFO)
  } else {
    utils.fprint(messages.WORK_IN_PROGRESS + ' ' + workLengthString(work.startDate), utils.messageType.INFO)
  }
}

const stop = async (_work, _break, endDate, promptNewApiToken = false) => {
  await clockify.getClockifyApiToken(promptNewApiToken)

  let userWorkspaces
  let errorStatusCode
  await clockify.getWorkSpacesAndProjects()
    .then(response => {
      userWorkspaces = response
    }).catch(statusCode => {
      errorStatusCode = statusCode
    })
  if (errorStatusCode != null) {
    switch (errorStatusCode) {
      case 401:
        await stop(_work, _break, endDate, true)
        return
      default:
        console.log(`[STATUS ${errorStatusCode}] Unhandled response status`)
    }
  }

  let { projectId, workspaceId } = await questions.askForProjectAndWorkspace(userWorkspaces)

  let apiKey = getFromStorage('api-key')
  if (apiKey) {
    clockify.addUserApiKey(apiKey)
    let description = await questions.askForWorkDescription()
    description = description.description ? description.description : messages.DEFAULT_DESCRIPTION
    let clockifyResponse
    try {
      const end = utils.isDateValid(endDate) ? endDate : new Date()
      const start = new Date(_work.startDate)
      clockifyResponse = await clockify.sendTimeEntries(workspaceId, projectId, description, {
        start: start.toISOString(),
        end: new Date(end - _break.total).toISOString(),
      })
    } catch (error) {
      throw new Error(error)
    }
    if (clockifyResponse.message === 'success') {
      console.log(`[STATUS ${clockifyResponse.statusCode}] Work was send to clockify`)
      const { isReached, workspaceGoal } = await goal.isWorkspaceGoalReached(workspaceId)
      if (isReached) {
        utils.fprint(`Slow down! You already reached your goal of ${workspaceGoal.hours} hours this month. Good job!`, utils.messageType.INFO)
      }
      removeFromStorage('work')
      removeFromStorage('break')
    } else {
      console.error(`[STATUS ${clockifyResponse.statusCode}] Something went wrong with request`)
    }
  } else {
    utils.fprint(messages.MISSING_API_KEY, utils.messageType.ERROR)
  }
}

const log = async (from, to) => {
  if (from && to) {
    await clockify.getClockifyApiToken()
    let startDate = utils.convertStringToDate(from)
    let endDate = utils.convertStringToDate(to)
    if (startDate > endDate) {
      let temp = startDate
      startDate = endDate
      endDate = temp
    }
    // TODO: implement me -> all logged work between these two dates (only entries done by clockclify?), look like 'git log'
  } else {
    utils.fprint(messages.DATE_RANGE_REQUIRED, utils.messageType.WARNING)
  }
}

const status = () => {
  const work = getFromStorage('work')
  if (work) {
    const pause = getFromStorage('break')
    if (pause && pause.startAt) {
      utils.fprint(messages.BREAK_IN_PROGRESS + ' ' + chalk.bgWhite.black(workLengthString(work.startDate, pause.startAt)), utils.messageType.INFO)
    } else {
      utils.fprint(messages.WORK_IN_PROGRESS + ' ' + chalk.bgWhite.black(workLengthString(work.startDate)), utils.messageType.INFO)
    }
  } else {
    utils.fprint(messages.NO_WORK_IN_PROGRESS, utils.messageType.INFO)
  }
}

const dump = () => {
  if (getFromStorage('work')) {
    removeFromStorage('work')
    utils.fprint(messages.REMOVED_WORK, utils.messageType.INFO)
  } else {
    utils.fprint(messages.NO_WORK_IN_PROGRESS, utils.messageType.WARNING)
  }
}

module.exports = {
  start,
  stop,
  log,
  status,
  dump,
  workLengthString,
}
