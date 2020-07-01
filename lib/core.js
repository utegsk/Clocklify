const clockify = require('./clockify')
const package = require('../package.json')
const configStore = require('configstore')
const questions = require('./questions')

const credentials = new configStore(package.name)

module.exports = {
    getClockifyApiToken: async() => {
        let token = credentials.get('api-key')
        if(!token){
            response = await questions.askForClockifyApiKey()
            credentials.set('api-key',response['apiKey'])
            token = response['apiKey']
            clockify.addUserApiKey(token)
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
    askForProjectOnWorkspace: async() => {
        let userWorkspaces = await core.getWorkSpacesAndProjects()
        let selectedWorkspace
        if(userWorkspaces.length === 1){
            selectedWorkspace = userWorkspaces[0].name
        }else{
            list = userWorkspaces.map(element => element.name)
            selectedWorkspace = await core.chooseWorkspace(list)
            selectedWorkspace = selectedWorkspace.workspace
        }
        let selectedProject
        let workspace = userWorkspaces.filter(element => element.name === selectedWorkspace)[0]
        if(workspace.projects.length === 1){

            selectedProject = workspace.projects[0].name
        }else{
            list = workspace.projects.map(element => element.name)
            selectedProject = await core.chooseProject(list)
            selectedProject = selectedProject.project
        }
        let project = workspace.projects.filter(project => project.name === selectedProject)[0]
        return {project,workspace}
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