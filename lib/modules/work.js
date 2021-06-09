const utils = require('../utils.js')
const chalk = require('chalk');
const questions = require('../questions.js');
const clockify = require("../clockify.js");
const mainPackage = require('../../package.json')
const messages = require('../messages.json')
const configStore = require("configstore");
const goal = require("./goal")
const credentials = new configStore(mainPackage.name)


const workLengthString = (startDate) => {
  if (!startDate) {
    utils.fprint(messages.START_DATE_MISSING, utils.messageType.ERROR)
    return
  }
  const difference = (Date.parse(new Date()) - Date.parse(new Date(startDate))) - (credentials.get('break') ? credentials.get('break').total : 0)
  const { seconds, minutes, hours, days } = utils.secondsToTimeIntervals(difference / 1e3)
  return `${utils.formatTimeString(days)} : ${utils.formatTimeString(hours)} : ${utils.formatTimeString(minutes)} : ${utils.formatTimeString(seconds)}`
}

const start = (time) => {
  let work = credentials.get('work')
  if (!work) {
    const now = new Date();
    if (time !== -1) {
      const regex = /\d{1,2}:\d{1,2}:?\d{0,2}/
      if (regex.test(time)) {
        const startTime = time.split(':')
        now.setHours(parseInt(startTime[0]))
        now.setMinutes(parseInt(startTime[1]))
        if (startTime.length === 3) {
          now.setSeconds(parseInt(startTime[2]))
        } else {
          now.setSeconds(0)
        }
      } else {
        utils.fprint(messages.WRONG_START_TIME_ENTRY, utils.messageType.ERROR)
        return
      }
      if (new Date().getTime() < now.getTime()) {
        utils.fprint(messages.WRONG_START_TIME_ENTRY_OVER, utils.messageType.ERROR)
        return
      }
    }
    credentials.set('work', { startDate: now.toUTCString(), })
    credentials.set('break', { total: 0, startAt: null })
    utils.fprint(messages.WORK_HAS_STARTED + ' at ' + now.toLocaleTimeString(), utils.messageType.INFO)
  } else {
    utils.fprint(messages.WORK_IN_PROGRESS + ' ' + workLengthString(work.startDate), utils.messageType.INFO)
  }
}

const stop = async (_work, _break, date, promptNewApiToken = false) => {
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
        await stop(_work, _break, date, true);
        return;
      default:
        console.log(`[STATUS ${errorStatusCode}] Unhandled response status`);
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
      let end, start
      if (date) {
        end = date.end
        start = date.start
      } else {
        end = new Date()
        start = new Date(_work.startDate)
      }
      end = new Date(Date.parse(end) - _break.total)
      clockifyResponse = await clockify.sendTimeEntries(workspaceId, projectId, description, {
        start: start.toISOString(),
        end: end.toISOString()
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
  let work = credentials.get('work')
  utils.fprint(work ? messages.WORK_IN_PROGRESS + ' ' + chalk.bgWhite.black(workLengthString(work.startDate)) : messages.NO_WORK_IN_PROGRESS, utils.messageType.INFO)
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
  workLengthString
}
