const clockify = require('./clockify')
const package = require('../package.json')
const configStore = require('configstore')
const questions = require('./questions')
const credentials = new configStore(package.name)
const help_config = require('./help.json')
const fs = require('fs')
const path = require('path')

const DEFAULT_DESCRIPTION = "Nothing else but honest work"
const WORK_IN_PROGRESS = "[WORK] Work in progress"
const WORK_HAS_STARTED = "[WORK] Work has started"
const MISSING_API_KEY = "[API-KEY] Couldn't find your api key"
const NO_WORK_IN_PROGRESS = "[WORK] No work in progress"
const REMOVED_WORK = "[WORK] Work was removed"
const NO_START_DATE = "[WORK] Couldn't find start date of work"
const WRONG_FILE_PATH = "[FILE] Specified file path couldn't be found"
const WRONG_FILE_FORMAT = "[FILE] Wrong file format, only .json allowed"
const WRONG_START_TIME_ENTRY = '[START TIME ENTRY] Time entry is not valid, use one of the following formats: \'HH:MM\',\'H:M\''
const WRONG_START_TIME_ENTRY_OVER = '[START TIME ENTRY] We are not there yet :). Enter the time you arrived to work.'
const NO_LUNCH_BREAK = "[LUNCH] Lunch break didn't start"
const LUNCH_WAS_ENDED = "[LUNCH] Lunch break was already stopped"
const LUNCH_IN_PROGRESS = "[LUNCH] Lunch break wasn't stopped"
const LUNCH_HAS_STARTED = "[LUNCH] Lunch break has started"
const LUNCH_HAS_ENDED = "[LUNCH] Lunch break has stopped"

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
        if(work.lunchStart){
            if(!work.lunchEnd){
                throw new Error(LUNCH_IN_PROGRESS)
            }
        }
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

const startWork = (time) => {
    let work = credentials.get('work')
    if(!work) {
      const now = new Date();
      if (time !== -1) {
        const regex = /\d{1,2}:\d{1,2}:?\d{0,2}/
        if (regex.test(time)) {
          const startTime = time.split(':')
          now.setHours(parseInt(startTime[0]))
          now.setMinutes(parseInt(startTime[1]))
          if (startTime.length === 3) {
            now.setSeconds(parseInt(startTime[2]))
          } else {
            now.setSeconds(0)
          }
        } else {
          console.error(WRONG_START_TIME_ENTRY)
          return
        }
        if (new Date().getTime() < now.getTime()) {
          console.error(WRONG_START_TIME_ENTRY_OVER)
          return
        }
      }
      credentials.set('work',{startDate : now.toUTCString(),})
      console.log(WORK_HAS_STARTED + ' at', now.toLocaleTimeString())
    } else {
        console.log(WORK_IN_PROGRESS)
        workLengthString(work.startDate)
    }
}

const convertStringToDate = (string) => { //expects date in format [YYYY-MM-DD-HH-MM]
    let stringArray = string.split("-")
    console.log(stringArray)
    return new Date(stringArray[0],Number(stringArray[1]) - 1,stringArray[2],stringArray[3],stringArray[4])
}

const logWork = async(start, end) => {
    await getClockifyApiToken()
    let startDate = convertStringToDate(start)
    let endDate = convertStringToDate(end)
    askForProjectAndWorkspace().then(async (response) => {
        if(response){
            try{
                await endWork(response.workspace.id,response.project.id,{start: startDate, end: endDate})
            }catch(err){
                console.error(err.message)
            }
        }
    })
}

const endWork = async(workspaceId, projectId,date) => {
    let work = credentials.get('work')
    if(work || (typeof date === 'object' && typeof date !== 'null')){
        let apiKey = credentials.get('api-key')
        if(apiKey){
            clockify.addUserApiKey(apiKey)
            let description = await questions.askForWorkDescription()
            description = description.description ? description.description : DEFAULT_DESCRIPTION
            let clockifyResponse
            try{
                let end,start
                if(date){
                    end = date.end
                    start = date.start
                }else{
                    end = new Date()
                    start = new Date(work.startDate)
                }
                if(work.lunchStart && work.lunchEnd){
                    const lunchDuration = Date.parse(work.lunchEnd) - Date.parse(work.lunchStart)
                    end = new Date(Date.parse(end) - lunchDuration)
                }
                clockifyResponse = await clockify.sendTimeEntries(workspaceId,projectId,description,{
                    start: start.toISOString(),
                    end: end.toISOString()
                })
            }catch(error){
                throw new Error(error)
            }
            if(clockifyResponse.message === 'success'){
                console.log(`[Code = ${clockifyResponse.statusCode}] Work was send to clokify`)
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
    let work = credentials.get('work')
    let lunchDifference = 0
    if(work.lunchStart && work.lunchEnd){
        lunchDifference = (Date.parse(work.lunchEnd) - Date.parse(work.lunchStart))
    }
    const difference = (Date.parse(new Date()) - Date.parse(new Date(startDate))) - lunchDifference // difference in miliseconds
    const seconds = Math.floor( (difference/1e3) % 60)
    const minutes = Math.floor( (difference/1e3/60) % 60)
    const hours = Math.floor( (difference/(1e3*60*60)) % 24)
    console.log(`Work length    ${formatTimeString(hours)} : ${formatTimeString(minutes)} : ${formatTimeString(seconds)}`)
}

const formatTimeString = (number) => {
    return number >= 10 ? '' + number : '0' + number
}

const startLunchBreak = () => {
    let work = credentials.get('work')
    if(work){
        if(!work.lunchStart){
            now = new Date()
            credentials.set('work',{...work,lunchStart: now.toUTCString()})
            console.log(LUNCH_HAS_STARTED + ' at', now.toLocaleTimeString())
            //place for Slack and Github api call
        }else{
            throw new Error(NO_LUNCH_BREAK)
        }
    }else{
        throw new Error(NO_WORK_IN_PROGRESS)
    }
}

const endLunchBreak = () => {
    let work = credentials.get('work')
    if(work){
        if(work.lunchStart){
            if(!work.lunchEnd){
                now = new Date()
                credentials.set('work',{...work,lunchEnd: now.toUTCString()})
                console.log(LUNCH_HAS_ENDED + ' at', now.toLocaleTimeString())
                //place for Slack and Github api call
            }else{
                throw new Error(LUNCH_WAS_ENDED)
            }
        }else{
            throw new Error(NO_LUNCH_BREAK)
        }
    }else{
        throw new Error(NO_WORK_IN_PROGRESS)
    }
}

const printVersion = () => {
    console.log(`v${package.version}`)
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
    logWork, // create work entrie from past with start and end dates
    printVersion, // print version of uteg-cli to terminal
    startLunchBreak, // start lunch break and change status on Slack/Github to "Lunch Time"
    endLunchBreak, // end lunch break and set status back to normal
}
