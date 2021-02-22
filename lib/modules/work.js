import { fprint, messageType } from '../utils'
import { askForWorkDescription, askForProjectAndWorkspace } from '../questions'
const credentials = new configStore(package.name)

const WORK_IN_PROGRESS = "Work in progress"
const WORK_HAS_STARTED = "Work has started"
const REMOVED_WORK = "Work was removed"
const WRONG_START_TIME_ENTRY = 'Time entry is not valid, use one of the following formats: \'HH:MM\',\'H:M\''
const WRONG_START_TIME_ENTRY_OVER = 'We are not there yet :). Enter the time you arrived to work.'
const DEFAULT_DESCRIPTION = "Nothing else but honest work"
const MISSING_API_KEY = "Couldn't find your api key"


const workLengthString = (startDate) => {
    if (!startDate) {
        throw new Error(NO_START_DATE)
    }
    let work = credentials.get('work')
    let lunchDifference = 0
    if (work.lunchStart && work.lunchEnd) {
        lunchDifference = (Date.parse(work.lunchEnd) - Date.parse(work.lunchStart))
    }
    const difference = (Date.parse(new Date()) - Date.parse(new Date(startDate))) - lunchDifference // difference in miliseconds
    const seconds = Math.floor( (difference/1e3) % 60)
    const minutes = Math.floor( (difference/1e3/60) % 60)
    const hours = Math.floor( (difference/(1e3*60*60)) % 24)
    console.log(`Work length    ${formatTimeString(hours)} : ${formatTimeString(minutes)} : ${formatTimeString(seconds)}`)
}

const start = (time) => {
    let work = credentials.get('work')
    if (!work) {
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
          fprint(WRONG_START_TIME_ENTRY, messageType.ERROR)
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

const stop = async(workspaceId, projectId,date) => {
    let work = credentials.get('work')
    if(work || (typeof date === 'object' && typeof date !== 'null')){
        let apiKey = credentials.get('api-key')
        if(apiKey){
            addUserApiKey(apiKey)
            let description = await askForWorkDescription()
            description = description.description ? description.description : DEFAULT_DESCRIPTION
            let clockifyResponse
            try{
                let end,start
                if (date) {
                    end = date.end
                    start = date.start
                } else {
                    end = new Date()
                    start = new Date(work.startDate)
                }
                if (work.lunchStart && work.lunchEnd) {
                    const lunchDuration = Date.parse(work.lunchEnd) - Date.parse(work.lunchStart)
                    end = new Date(Date.parse(end) - lunchDuration)
                }
                clockifyResponse = await sendTimeEntries(workspaceId,projectId,description,{
                    start: start.toISOString(),
                    end: end.toISOString()
                })
            } catch(error) {
                throw new Error(error)
            }
            if (clockifyResponse.message === 'success') {
                console.log(`[Code = ${clockifyResponse.statusCode}] Work was send to clokify`)
                credentials.delete('work')
            } else {
                console.error(`[Code = ${clockifyResponse.statusCode}] Something went wrong with request`)
            }
        } else {
            throw new Error(MISSING_API_KEY)
        }
    } else {
        throw new Error(NO_WORK_IN_PROGRESS)
    }
}

const log = async(start, end) => {
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

const status = () => {
    let work = credentials.get('work')
    if (work) {
        console.log(WORK_IN_PROGRESS)
        workLengthString(work.startDate)
    } else {
        console.log(NO_WORK_IN_PROGRESS)
    }
}

const dump = () => {
    if (credentials.get('work')) {
        credentials.delete('work')
        console.log(REMOVED_WORK)
    } else {
        throw new Error(NO_WORK_IN_PROGRESS)
    }
}

export default {
    start,
    stop,
    log,
    status,
    dump,
    workLengthString
}