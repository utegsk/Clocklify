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
    for (const workspace of goal.workspaces) {
      const response = await clockify.getCurrentMonthWorkingTime(workspace.id)
      const userFromResponse = response.groupOne.filter(user => user._id === credentials.get('user').id)[0]
      const percentage = (userFromResponse.duration / 3600) / workspace.hours * 100
      const hoursLeft = workspace.hours - (userFromResponse.duration / 3600)
      content.push([workspace.name, workspace.hours, Math.round(percentage * 100) / 100, hoursLeft > 0 ? Math.round(hoursLeft * 100) / 100 : 'done', workspace.month !== new Date().getMonth()])
    }
    console.log('content', content)
    utils.createTable({
      header: ['workspace', 'goal', 'done %', 'hours left', 'active'],
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
  const response = await clockify.getCurrentMonthWorkingTime(workspaceId)
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
