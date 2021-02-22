const inquirer = require('inquirer')
const messages = require('./messages.json')


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
  return inquirer.prompt(questions);
}

const askForProjectAndWorkspace = async (userWorkspaces) => {
  let selectedWorkspace
  if (userWorkspaces.length === 1) {
    selectedWorkspace = userWorkspaces[0].name
  } else {
    let list = userWorkspaces.map(element => element.name)
    selectedWorkspace = await chooseWorkspace(list)
    selectedWorkspace = selectedWorkspace.workspace
  }
  let selectedProject
  let workspace = userWorkspaces.filter(element => element.name === selectedWorkspace)[0]
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
  return inquirer.prompt(questions);
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
  return inquirer.prompt(question);
}

const chooseProject = (list) => {
  const question = [{
    name: 'project',
    type: 'list',
    message: messages.SELECT_PROJECT,
    choices: list,
  }];
  return inquirer.prompt(question);
}


module.exports = {
  askForClockifyApiKey,
  askForProjectAndWorkspace,
  askForWorkDescription
}
