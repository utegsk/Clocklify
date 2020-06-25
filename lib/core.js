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
        return new Promise((resolve, reject) => {
            let workspaces
            clockify.findUserWorkspaces().then(response => {
                workspaces = response
                clockify.getAllProjects(workspaces[0].id).then(projects => {
                    workspaces[0]['projects'] = projects
                    resolve(workspaces)
                }).catch(error => {
                    reject(error)
                })
            }).catch(error => {
                reject(error)
            })
        })
    },
    chooseWorkspace: async (list) => {
        let workspace = await questions.chooseWorkspace(list)
        return workspace
    },
    chooseProject: async (list) => {
        let project = await questions.chooseProject(list)
        return project
    },
}