const clockify = require('./clockify')
const package = require('../package.json')
const configStore = require('configstore')
const questions = require('./questions')

const credentials = new configStore(package.name)

module.exports = {
    getClockifyApiToken: async () => {
        let token = credentials.get('api-key')
        if(!token){
            questions.askForClockifyApiKey().then(response => {
                credentials.set('api-key',response['apiKey'])
                token = response['apiKey']
                clockify.addUserApiKey(token)
            }).catch((error) => {
                console.error(error)
            })
        }else{
            clockify.addUserApiKey(token)
        }
        return token
    },
    getWorkSpacesAndProjects: async () => {
        let workspaces = await clockify.findUserWorkspaces()
        let projects = await clockify.getAllProjects(workspaces[0].id)
        workspaces[0].projects = projects
        return workspaces
    },
    chooseWorkspace: async () => {
        let workspace = await questions.chooseWorkspace(['sjd asjdnajsn','adam','nic'])
        return workspace
    }
}