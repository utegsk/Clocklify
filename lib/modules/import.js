const path = require('path')
const fs = require('fs')
const clockify = require("../clockify")
const questions = require("../questions")
const utils = require("../utils")
const messages = require('../messages.json')


const importTimeEntries = (filePath) => {
    if (path.extname(filePath) !== '.json') {
      utils.fprint(messages.WRONG_FILE_FORMAT, utils.messageType.ERROR)
      return
    }
    if (fs.existsSync(filePath)) {
        fs.readFile(filePath,'utf8', (err,data) => {
            if(err){
                throw new Error(`[FILE] ${err.message}`)
            }
            createDateEntriesFromFile(data)
        })
    } else {
        utils.fprint(messages.WRONG_FILE_PATH, utils.messageType.ERROR)
    }
}

const createDateEntriesFromFile = async(json) => {
    try {
        await clockify.getClockifyApiToken() //look for api key or ask for it
        questions.askForProjectAndWorkspace().then(response => {
            const entries = JSON.parse(json)
            entries.forEach(async (entry, index) => {
                let startDate = new Date(entry.date)
                startDate.setHours(utils.parseProvidedTime(entry.from).hour)
                startDate.setMinutes(utils.parseProvidedTime(entry.from).minute)
                let endDate = new Date(entry.date)
                endDate.setHours(utils.parseProvidedTime(entry.to).hour)
                endDate.setMinutes(utils.parseProvidedTime(entry.to).minute)
                let description = entry.note ? entry.note : messages.DEFAULT_DESCRIPTION
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
        utils.fprint(err.message, utils.messageType.ERROR)
    }
}

module.exports = {
    importTimeEntries
}
