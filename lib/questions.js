import { prompt } from 'inquirer';

export function askForClockifyApiKey() {
  const questions = [
    {
      name: 'apiKey',
      type: 'input',
      message: 'Enter your clockify api key:',
      validate: function (value) {
        if (value.length) {
          return true;
        } else {
          return 'Please enter your clockify api key.';
        }
      }
    },
  ];
  return prompt(questions);
}
export function askForWorkDescription() {
  const questions = [
    {
      name: 'description',
      type: 'input',
      message: 'Enter description to your work:',
    },
  ];
  return prompt(questions);
}
export function chooseWorkspace(list) {
  const question = [{
    name: 'workspace',
    type: 'list',
    message: 'Select one of your workspaces:',
    choices: list,
    validate: (value) => {
      if (value.length) {
        return true;
      } else {
        return 'Please enter your clockify api key.';
      }
    }
  }];
  return prompt(question);
}
export function chooseProject(list) {
  const question = [{
    name: 'project',
    type: 'list',
    message: 'Select one of your projects:',
    choices: list,
  }];
  return prompt(question);
}
