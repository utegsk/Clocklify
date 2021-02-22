// import time entries from json
import { extname } from 'path'
import { readFile, existsSync } from 'fs'


const WRONG_FILE_PATH = "[FILE] Specified file path couldn't be found"
const WRONG_FILE_FORMAT = "[FILE] Wrong file format, only .json allowed"


const importTimeEntries = (filePath) => {
    if (extname(filePath) !== '.json') throw new Error(WRONG_FILE_FORMAT)
    if (existsSync(filePath)) {
        readFile(filePath,'utf8', (err,data) => {
            if(err){
                throw new Error(`[FILE] ${err.message}`)
            }
            createDateEntriesFromFile(data)
        })
    } else {
        throw new Error(WRONG_FILE_PATH)
    }
}

const createDateEntriesFromFile = async(json) => {
    try {
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
                try {
                    clockifyResponse = await clockify.sendTimeEntries(response.workspace.id, response.project.id, description, {start: startDate, end: endDate})
                } catch(error) {
                    throw new Error(error)
                }
                if (clockifyResponse.message === 'success') {
                    console.log(`[Code = ${clockifyResponse.statusCode}] request ${index} -> success`)
                } else {
                    console.error(`[Code = ${clockifyResponse.statusCode}] request ${index} -> failure`)
                }
            })
        })
    } catch(err) {
        console.error(err.message)
    }
}

export default {
    importTimeEntries
}