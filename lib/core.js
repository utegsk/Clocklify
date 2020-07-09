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
    //resolve all project in all posible workspaces
    getWorkSpacesAndProjects: async () => {
        return new Promise((resolve, reject) => {
            let workspaces
            clockify.findUserWorkspaces().then(response => {
                workspaces = response
                workspaces.forEach((workspace,index)=> {
                    clockify.getAllProjects(workspace.id).then(projects => {
                        workspaces[index]['projects'] = projects
                        resolve(workspaces)
                    }).catch(error => {
                        reject(error)
                    })
                })
            }).catch(error => {
                reject(error)
            })
        })
    },
    // ask for workspaces and all posible projects
    askForProjectOnWorkspace: async() => {
        let userWorkspaces = await module.exports.getWorkSpacesAndProjects()
        let selectedWorkspace
        if(userWorkspaces.length === 1){
            selectedWorkspace = userWorkspaces[0].name
        }else{
            list = userWorkspaces.map(element => element.name)
            selectedWorkspace = await module.exports.chooseWorkspace(list)
            selectedWorkspace = selectedWorkspace.workspace
        }
        let selectedProject
        let workspace = userWorkspaces.filter(element => element.name === selectedWorkspace)[0]
        if(workspace.projects.length === 1){

            selectedProject = workspace.projects[0].name
        }else{
            list = workspace.projects.map(element => element.name)
            selectedProject = await module.exports.chooseProject(list)
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
    startWork: (project, workspace) => {
        if(!credentials.get('work')){
            let timestamp = new Date()
            credentials.set('work',{
                startDate : timestamp.toUTCString(),
                projectId: project.id,
                workspaceId: workspace.id
            })
        }else{
            console.error("Work already in progress")
            process.exit()
        }
    },

    endWork: () => {
        let work = credentials.get('work')
        if(work){
            let endTime = new Date();
            let startTime = new Date(work.startDate)
            console.log(endTime.getTime())
            console.log(startTime.getTime())
            let diference = Math.abs((endTime.getTime() / 1e3) - (startTime.getTime() / 1e3))
            console.log(diference)
        }else{
            console.error("No work was started")
            process.exit()
        }

    }

}