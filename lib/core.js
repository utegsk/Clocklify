const clockify = require('./clockify')
const {name:packageName} = require('../package.json')
const configStore = require('configstore')
const questions = require('./questions')
const credentials = new configStore(packageName)
const help_config = require('./help.json')
const fs = require('fs')
const path = require('path')

const DEFAULT_DESCRIPTION = "Not much but honest work" 
const WORK_IN_PROGRESS = "[WORK] Work in progress"
const WORK_STARTED = "[WORK] Work has started"
const MISSING_API_KEY = "[API-KEY] Couldn't find your api key"
const NO_WORK_IN_PROGRESS = "[WORK] No work in progress"
const REMOVED_WORK = "[WORK] Work was removed"
const NO_START_DATE = "[WORK] Couldn't find start date of work"
const WRONG_FILE_PATH = "[FILE] Specified file path couldn 't be found'"
const WRONG_FILE_FORMAT = "[FILE] Wrong file format, only .json allowed"

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

const checkWork = () => {
    let work = credentials.get('work')
    if(work){
        workLengthString(work.startDate)
    }else{
        throw new Error(NO_WORK_IN_PROGRESS)
    }
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
const askForProjectAndWorkspace = async() => {
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
        workLengthString(work.startDate)
    }
}
const convertStringToDate = (string) => { //expects date in format [YYYY-MM-DD-HH-MM]
    return string

}
const logWork = async(start, end) => {
    let startDate = convertStringToDate(start)
    let endDate = convertStringToDate(end)
    console.log(startDate,endDate)
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
    console.log(help_config.packageName)
    console.log("   " + help_config.usage)
    console.log("       " + help_config.usageExample)
    console.log("")
    Object.entries(help_config.commands).forEach(([key,value]) => {
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
        workLengthString(work.startDate)
    } else {
        console.log(NO_WORK_IN_PROGRESS)
    }
}
const parseProvidedTime = (timeString) => { // '14:00' -> { hour: 14, minute: 0 }
    let [hour,minute] = timeString.split(":")
    return {hour,minute}
}
const createDateEntriesFromFile = async(json) => {
    try{
        await getClockifyApiToken() //look for api key or ask for it
        askForProjectAndWorkspace().then(response => {
            const entries = JSON.parse(json)
            entries.forEach(async (entry, index) => {
                let startDate = new Date(entry.date)
                startDate.setHours(parseProvidedTime(entry.from).hour)
                startDate.setMinutes(parseProvidedTime(entry.from).minute)
                let endDate = new Date(entry.date)
                endDate.setHours(parseProvidedTime(entry.to).hour)
                endDate.setMinutes(parseProvidedTime(entry.to).minute)
                let description = entry.note ? entry.note : DEFAULT_DESCRIPTION
                let clockifyResponse
                try{
                    clockifyResponse = await clockify.sendTimeEntries(response.workspace.id, response.project.id, description, {start: startDate, end: endDate})
                }catch(error){
                    throw new Error(error)
                }
                if(clockifyResponse.message === 'success'){
                    console.log(`[Code = ${clockifyResponse.statusCode}] request ${index} -> success`)
                }else{
                    console.error(`[Code = ${clockifyResponse.statusCode}] request ${index} -> failure`)
                }
            })
        })
    }catch(err){
        console.error(err.message)
    }
}
const checkFileAndSendRequest = (filePath) => {
    if(path.extname(filePath) !== '.json') throw new Error(WRONG_FILE_FORMAT)
    if(fs.existsSync(filePath)){
        fs.readFile(filePath,'utf8', (err,data) => {
            if(err){
                throw new Error(`[FILE] ${err.message}`)
            }
            createDateEntriesFromFile(data)
        })
    }else{
        throw new Error(WRONG_FILE_PATH)
    }
}
const workLengthString = (startDate) => {
    if(!startDate){
        throw new Error(NO_START_DATE)
    }
    const difference = (Date.parse(new Date()) - Date.parse(new Date(startDate))) // difference in miliseconds
    const seconds = Math.floor( (difference/1e3) % 60)
    const minutes = Math.floor( (difference/1000/60) % 60)
    const hours = Math.floor( (difference/(1000*60*60)) % 24)
    console.log(`Work length    ${formatTimeString(hours)} : ${formatTimeString(minutes)} : ${formatTimeString(seconds)}`)
}
const formatTimeString = (number) => {
    return number >= 10 ? '' + number : '0' + number  
}
module.exports = {
    getClockifyApiToken, //look for api key or ask for it
    getWorkSpacesAndProjects, // make request to clockify and map projects to it's workspace and return it
    askForProjectAndWorkspace, // ask to choose from maped projects and workspaces
    chooseProject, // ask to choose one of possible projects
    chooseWorkspace, // ask to choose one of possible workspaces
    wrongArgument,  // print 'wrong argument' to terminal
    workStatus, // print status of work
    help, // print help to terminal
    deleteWork, // check if there is work and detele its
    startWork, // start new instance of work
    endWork, // end work and send request to clockify api than delete work
    checkWork, // check if there is started work and prints length string
    checkFileAndSendRequest, // check if provided file is valid and make request for each provided entry
    logWork // create work entrie from past with start and end dates
}
