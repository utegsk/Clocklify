const inquirer = require('inquirer')
const messages = require('./messages.json')

const promptQuestion = async ({ message, questionName, questionType, choices, validateFunction }) => {
  const questions = [{
    name: questionName,
    type: questionType,
    choices,
    message,
    validate: validateFunction
  }]
  return inquirer.prompt(questions)
}

const askForClockifyApiKey = () => {
  return promptQuestion({
    message: messages.ENTER_API_KEY,
    questionName: 'apiKey',
    questionType: 'input',
    validateFunction: function (value) {
      if (value.length) {
        return true;
      } else {
        return messages.ENTER_API_KEY;
      }
    }
  })
}

const askForGoalHours = ({ name }) => {
  return promptQuestion({
    questionName: 'hours',
    questionType: 'input',
    message: messages.ENTER_GOAL_HOURS + name + ":",
    validateFunction: (value) => {
      try {
        const hours = parseFloat(value)
        if (hours > 0) {
          return true;
        } else {
          return messages.ENTER_GOAL_HOURS + name + ":";
        }
      } catch (error) {
        return messages.FAILED_TO_PARSE;
      }
    }
  })
}

const askForWorkspace = async (workspaces) => {
  let selected = workspaces.length === 1 ? { workspace: workspaces[0].name } : await chooseWorkspace(workspaces.map(element => element.name))
  return workspaces.find(element => element.name === selected.workspace)
}


const askForProjectAndWorkspace = async (workspaces) => {
  let selectedProject
  let workspace = await askForWorkspace(workspaces)
  if (workspace.projects.length === 1) {
    selectedProject = workspace.projects[0].name
  } else {
    let list = workspace.projects.map(element => element.name)
    selectedProject = await chooseProject(list)
    selectedProject = selectedProject.project
  }
  let project = workspace.projects.find(project => project.name === selectedProject)
  return { projectId: project.id, workspaceId: workspace.id }
}

const askForWorkDescription = () => {
  return promptQuestion({
    questionName: 'description',
    questionType: 'input',
    message: messages.ENTER_WORK_DESCRIPTION,
  })
}

const chooseWorkspace = (list) => {
  return promptQuestion({
    questionName: 'workspace',
    questionType: 'list',
    choices: list,
    message: messages.SELECT_WORKSPACE,
    validateFunction: (value) => {
      if (value.length) {
        return true;
      } else {
        return messages.ENTER_API_KEY;
      }
    }
  })
}

const chooseProject = (list) => {
  return promptQuestion({
    questionName: 'project',
    questionType: 'list',
    choices: list,
    message: messages.SELECT_PROJECT,
  })
}


module.exports = {
  askForClockifyApiKey,
  askForGoalHours,
  askForProjectAndWorkspace,
  askForWorkspace,
  askForWorkDescription,
  promptQuestion
}
