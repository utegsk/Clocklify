const utils = require('../utils.js')
const chalk = require('chalk');
const questions = require('../questions.js')
const clockify = require('../clockify.js')
const mainPackage = require('../../package.json')
const messages = require('../messages.json')

const configStore = require('configstore')
const goal = require('./goal')
const credentials = new configStore(mainPackage.name)


const workLengthString = (startDate, endDate = new Date().toString()) => {
  if (!startDate) {
    utils.fprint(messages.START_DATE_MISSING, utils.messageType.ERROR)
    return
  }
  const difference = (Date.parse(new Date(endDate)) - Date.parse(new Date(startDate))) - (credentials.get('break') ? credentials.get('break').total : 0)
  const { minutes, hours, days, seconds } = utils.secondsToTimeIntervals(difference / 1e3)
  const formatedSeconds = seconds > 0 && minutes < 1 ? `${utils.formatTimeString(seconds)} sec.` : ''
  const formatedMinutes = minutes > 0 ? `${utils.formatTimeString(minutes)} min.` : ''
  const formatedHours = hours > 0 ? `${utils.formatTimeString(hours)} h.` : ''
  const formatedDays = days > 0 ? `${utils.formatTimeString(days)} d.` : ''
  return `${formatedDays} ${formatedHours} ${formatedMinutes} ${formatedSeconds}`.trim()
}

const start = (startDate) => {
  let work = credentials.get('work')
  if (!work) {
    credentials.set('work', { startDate: startDate.toUTCString() })
    credentials.set('break', { total: 0, startAt: null })
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

  let apiKey = credentials.get('api-key')
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
      credentials.delete('work')
      credentials.delete('break')
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
  const work = credentials.get('work')
  if (work) {
    const pause = credentials.get('break')
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
  if (credentials.get('work')) {
    credentials.delete('work')
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
