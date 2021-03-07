const { isDateValid, fprint, messageType, createTable } = require("../utils")
const messages = require('../messages.json')
const { addUserApiKey, getClockifyApiToken, findUserWorkspaces, getWorkingTimeFromRange } = require('../clockify')
const { askForWorkspace } = require('../questions')
const mainPackage = require('../../package.json')
const configStore = require('configstore')
const credentials = new configStore(mainPackage.name)

const parseLogEntry = (date) => {
    const parsedDate = new Date(date)
    if (isDateValid(parsedDate)) {
        return parsedDate
    } else {
        fprint(`'${date}' ${messages.INVALID_LOG_DATE}`, messageType.ERROR)
    }
}

const logWork = async (start, end) => {
    const startDate = parseLogEntry(start)
    const endDate = parseLogEntry(end)
    const apiToken = await getClockifyApiToken()
    addUserApiKey(apiToken)
    const userWorkspaces = await findUserWorkspaces()
    const selectedWorkspace = await askForWorkspace(userWorkspaces)
    const response = await getWorkingTimeFromRange(selectedWorkspace.id, startDate, endDate, ["PROJECT", "DATE", "TIMEENTRY"])
    const user = credentials.get('user')
    const userWorkEntries = response.groupOne.find(item => item._id === user.id)
    const parsedEntries = []
    userWorkEntries.children.forEach(entry => {
        entry.children.forEach(item => {
            parsedEntries.push({
                name: item.name,
                duration: item.duration
            })
        })
    })
    // console.log(parsedEntries)
    // createTable({
    //     header: ['name', 'duration'],
    //     content: parsedEntries
    // })
    console.table(parsedEntries)

}

module.exports = {
    logWork
}