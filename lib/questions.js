const inquirer = require('inquirer');

module.exports = {
  askForClockifyApiKey: () => {
    const questions = [
      {
        name: 'apiKey',
        type: 'input',
        message: 'Enter your clockify api key:',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter your clockify api key.';
          }
        }
      },
    ];
    return inquirer.prompt(questions);
  },
  chooseWorkspace: (list) => {
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
    }]
    return inquirer.prompt(question)
  },
  chooseProject: (list) => {
    const question = [{
      name: 'project',
      type: 'list',
      message: 'Select one of your projects:',
      choices: list,
    }]
    return inquirer.prompt(question)
  }
};
