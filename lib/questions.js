const inquirer = require('inquirer')
const messages = require('./messages.json')


const askForInput = (questions) => {
  return inquirer.prompt(questions);
}

const askForClockifyApiKey = () => {
  const questions = [
    {
      name: 'apiKey',
      type: 'input',
      message: messages.ENTER_API_KEY,
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return messages.ENTER_API_KEY;
        }
      }
    },
  ];
  return askForInput(questions)
}

const askForGoalHours = ({ name }) => {
  const questions = [
    {
      name: 'hours',
      type: 'input',
      message: messages.ENTER_GOAL_HOURS + name + ":",
      validate: (value) => {
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
    },
  ];
  return askForInput(questions)
}

const askForWorkspace = async (workspaces) => {
  let selected = workspaces.length === 1 ? { workspace: workspaces[0].name } : await chooseWorkspace(workspaces.map(element => element.name))
  return workspaces.filter(element => element.name === selected.workspace)[0]
}


const askForProjectAndWorkspace = async (workspaces) => {
  // let selectedWorkspace
  // if (userWorkspaces.length === 1) {
  //   selectedWorkspace = userWorkspaces[0].name
  // } else {
  //   let list = userWorkspaces.map(element => element.name)
  //   selectedWorkspace = await chooseWorkspace(list)
  //   selectedWorkspace = selectedWorkspace.workspace
  // }
  let selectedProject
  let workspace = await askForWorkspace(workspaces) //userWorkspaces.filter(element => element.name === selectedWorkspace)[0]
  if (workspace.projects.length === 1) {
    selectedProject = workspace.projects[0].name
  } else {
    let list = workspace.projects.map(element => element.name)
    selectedProject = await chooseProject(list)
    selectedProject = selectedProject.project
  }
  let project = workspace.projects.filter(project => project.name === selectedProject)[0]
  return { projectId: project.id, workspaceId: workspace.id }
}

const askForWorkDescription = () => {
  const questions = [
    {
      name: 'description',
      type: 'input',
      message: messages.ENTER_WORK_DESCRIPTION,
    },
  ];
  return askForInput(questions);
}

const chooseWorkspace = (list) => {
  const question = [{
    name: 'workspace',
    type: 'list',
    message: messages.SELECT_WORKSPACE,
    choices: list,
    validate: (value) => {
      if (value.length) {
        return true;
      } else {
        return messages.ENTER_API_KEY;
      }
    }
  }];
  return askForInput(question);
}

const chooseProject = (list) => {
  const question = [{
    name: 'project',
    type: 'list',
    message: messages.SELECT_PROJECT,
    choices: list,
  }];
  return askForInput(question);
}


module.exports = {
  askForClockifyApiKey,
  askForGoalHours,
  askForProjectAndWorkspace,
  askForWorkspace,
  askForWorkDescription
}
