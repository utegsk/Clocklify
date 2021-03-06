const mainPackage = require('../../package.json')
const messages = require('../messages.json')
const questions = require('../questions')
const clockify = require('../clockify')
const configStore = require('configstore')
const credentials = new configStore(mainPackage.name)
const utils = require('../utils')


const on = async (goal) => {
  if (goal.active) {
    utils.fprint(messages.GOAL_ALREADY_ON, utils.messageType.INFO)
  } else {
    credentials.set('goal', { ...goal, active: true })
    utils.fprint(messages.GOAL_ON, utils.messageType.INFO)
  }
}

const off = async (goal) => {
  if (goal.active) {
    credentials.set('goal', { ...goal, active: false })
    utils.fprint(messages.GOAL_OFF, utils.messageType.INFO)
  } else {
    utils.fprint(messages.GOAL_ALREADY_OFF, utils.messageType.INFO)
  }
}

const status = async (goal) => {
  if (goal.active) {
    const content = []
    const now = new Date()
    for (const workspace of goal.workspaces) {
      const start = new Date(now.getFullYear(), workspace.month, 1, 0, 0, 0)
      const end = new Date(now.getFullYear(), workspace.month + 1, 1, 0, 0, 0)
      const response = await clockify.getWorkingTimeFromRange(workspace.id, start, end, ["USER", "PROJECT"])
      const userFromResponse = response.groupOne.filter(user => user._id === credentials.get('user').id)
      if (userFromResponse.length === 0) {
        userFromResponse.push({ duration: 0 })
      }
      const percentage = (userFromResponse[0].duration / 3600) / workspace.hours * 100
      const minutesLeft = (workspace.hours * 60) - (userFromResponse[0].duration / 60)
      content.push([
        workspace.name,
        workspace.hours + 'h',
        Math.round(percentage * 100) / 100,
        minutesLeft > 0 ? Math.floor(minutesLeft / 60) + 'h ' + Math.floor((minutesLeft / 60 - Math.floor(minutesLeft / 60)) * 60) + 'min' : 'done',
        messages.monthsShort[workspace.month]
      ])
    }
    utils.createTable({
      header: ['workspace', 'goal', 'done %', 'time left', 'month'],
      content,
    })
  } else {
    utils.fprint(messages.GOAL_STATUS_OFF, utils.messageType.INFO)
  }
}

const getWorkspaceGoal = async (workspaceId = null) => {
  let goal = credentials.get('goal')
  if (goal) {
    if (!workspaceId) {
      const workspace = await questions.askForWorkspace(await clockify.getWorkSpacesAndProjects())
      workspaceId = workspace.id
    }

    const present = goal.workspaces.filter(workspace => workspace.id === workspaceId)
    if (present.length === 0) {
      present.push(null)
    } else if (present[0].month !== new Date().getMonth()) {
      present[0] = await set(workspaceId)
    }
    return { active: goal.active, goal: present[0] }
  }
  return { active: false, goal: null }
}

const set = async (workspaceId = null) => {
  const goal = credentials.get('goal')
  const workspaces = await clockify.getWorkSpacesAndProjects()
  let workspace = workspaceId ? workspaces.filter(ws => ws.id === workspaceId)[0] : await questions.askForWorkspace(workspaces)

  const present = goal.workspaces.filter(ws => ws.id === workspace.id)
  if (present.length === 1) {
    const pick = await questions.askForGoalHours(workspace)
    present[0].hours = pick.hours
    present[0].month = new Date().getMonth()
  } else {
    const pick = await questions.askForGoalHours(workspace)
    const temp = {
      id: workspace.id,
      name: workspace.name,
      month: new Date().getMonth(),
      hours: pick.hours
    }
    goal.workspaces.push(temp)
    present.push(temp)
  }
  credentials.set('goal', goal)
  utils.fprint(messages.NEW_GOAL, utils.messageType.INFO)
  return present[0]
}

const isWorkspaceGoalReached = async (workspaceId) => {
  const { active, goal } = await getWorkspaceGoal(workspaceId)
  if (!active || !goal) {
    return { isReached: false, workspaceGoal: null }
  }
  const now = new Date()
  const start = new Date(now.getFullYear(), goal.month, 1, 0, 0, 0)
  const end = new Date(now.getFullYear(), goal.month + 1, 1, 0, 0, 0)
  const response = await clockify.getWorkingTimeFromRange(workspaceId, start, end, ["USER", "PROJECT"])
  const userFromResponse = response.groupOne.filter(user => user._id === credentials.get('user').id)[0]
  return { isReached: goal.hours <= (userFromResponse.duration / 3600), workspaceGoal: goal }
}

module.exports = {
  on,                       //
  off,                      //
  status,                   //
  set,                      //
  isWorkspaceGoalReached,   //
}
