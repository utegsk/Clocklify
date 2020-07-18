const clockify = require('./clockify')
const {name:packageName} = require('../package.json')
const configStore = require('configstore')
const questions = require('./questions')
const fs = require('fs')
const credentials = new configStore(packageName)

const DEFAULT_DESCRIPTION = "Not much but honest work" 
const WORK_IN_PROGRESS = "[WORK] Work in progress"
const WORK_STARTED = "[WORK] Work started"
const MISSING_API_KEY = "[API-KEY] Couldn't find your api key"
const NO_WORK_IN_PROGRESS = "[WORK] No work in progress"
const REMOVED_WORK = "[WORK] Work was removed"

const getClockifyApiToken = async () => {
    let token = credentials.get('api-key')
    if(!token) {
        response = await questions.askForClockifyApiKey()
        credentials.set('api-key',response['apiKey'])
        token = response['apiKey']
        clockify.addUserApiKey(token)
    } else {
        clockify.addUserApiKey(token)
    }
    return token
} 

const getWorkSpacesAndProjects = async () => {
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
}
const askForProjectOnWorkspace = async() => {
    let userWorkspaces = await getWorkSpacesAndProjects()
    let selectedWorkspace
    if(userWorkspaces.length === 1){
        selectedWorkspace = userWorkspaces[0].name
    }else{
        list = userWorkspaces.map(element => element.name)
        selectedWorkspace = await chooseWorkspace(list)
        selectedWorkspace = selectedWorkspace.workspace
    }
    let selectedProject
    let workspace = userWorkspaces.filter(element => element.name === selectedWorkspace)[0]
    if(workspace.projects.length === 1){

        selectedProject = workspace.projects[0].name
    }else{
        list = workspace.projects.map(element => element.name)
        selectedProject = await chooseProject(list)
        selectedProject = selectedProject.project
    }
    let project = workspace.projects.filter(project => project.name === selectedProject)[0]
    return {project,workspace}
}
const chooseWorkspace = async (list) => {
    let workspace = await questions.chooseWorkspace(list)
    return workspace
}
const chooseProject = async (list) => {
    let project = await questions.chooseProject(list)
    return project
}
const startWork = () => {
    let work = credentials.get('work')
    if(!work) {
        var now = new Date()
        credentials.set('work',{
            startDate : now.toUTCString(),
        })
        console.log(WORK_STARTED)
    } else {
        console.log(WORK_IN_PROGRESS)
        workLenghtString(work.startDate)
    }
}
const endWork = async(workspaceId, projectId) => {
    let work = credentials.get('work')
    if(work){
        let apiKey = credentials.get('api-key')
        if(apiKey){
            clockify.addUserApiKey(apiKey)
            let description = await questions.askForWorkDescription()
            description = description.description ? description.description : DEFAULT_DESCRIPTION
            let clockifyResponse
            try{
                let end = new Date()
                let start = new Date(work.startDate)
                clockifyResponse = await clockify.sendTimeEntries(workspaceId,projectId,description,{
                    start: start.toISOString(),
                    end: end.toISOString()
                })
            }catch(error){
                throw new Error(error)
            }
            if(clockifyResponse.message === 'success'){
                console.log(`[Code = ${clockifyResponse.statusCode}] Work was sent to clokify`)
                credentials.delete('work')
            }else{
                console.error(`[Code = ${clockifyResponse.statusCode}] Something went wrong with request`)
            }
        }else{
            throw new Error(MISSING_API_KEY)
        }
    }else{
        throw new Error(NO_WORK_IN_PROGRESS)
    }
}
const deleteWork = () => {
    if(credentials.get('work')){
        credentials.delete('work')
        console.log(REMOVED_WORK)
    }else{
        throw new Error(NO_WORK_IN_PROGRESS)
    }
}
const help = () => {
    const json = fs.readFileSync('lib/help.json')
    let help = JSON.parse(json)
    console.log(help.packageName)
    console.log("   " + help.usage)
    console.log("       " + help.usageExample)
    console.log("")
    Object.entries(help.commands).forEach(([key,value]) => {
        console.log(`   ${key} -> ${value}`)
    })
}
const wrongArgument = (argument) => {
    if(argument === undefined){
        help()
        return
    }
    console.log(`'${argument}' was unrecognized command`)
    help()
}
const workStatus = () => {
    let work = credentials.get('work')
    if(work){
        console.log(WORK_IN_PROGRESS)
        workLenghtString(work.startDate)
    } else {
        console.log(NO_WORK_IN_PROGRESS)
    }
}
const workLenghtString = (startDate) => {
    const difference = (Date.parse(new Date()) - Date.parse(new Date(startDate))) // difference in miliseconds
    const seconds = Math.floor( (difference/1e3) % 60)
    const minutes = Math.floor( (difference/1000/60) % 60)
    const hours = Math.floor( (difference/(1000*60*60)) % 24)
    console.log(`Work lenght    ${formatTimeString(hours)} : ${formatTimeString(minutes)} : ${formatTimeString(seconds)}`)
}
const formatTimeString = (number) => {
    return number >= 10 ? '' + number : '0' + number  
}
module.exports = {
    getClockifyApiToken,
    getWorkSpacesAndProjects,
    askForProjectOnWorkspace,
    chooseProject,
    chooseWorkspace,
    wrongArgument,
    workStatus,
    help,
    deleteWork,
    startWork,
    endWork
}