const { isDateValid, fprint, messageType, createTable, secondsToTimeIntervals, formatTimeString } = require("../utils")
const messages = require('../messages.json')
const { addUserApiKey, getClockifyApiToken, findUserWorkspaces, getWorkingTimeFromRange } = require('../clockify')
const { askForWorkspace } = require('../questions')

const parseLogEntry = (date) => {
    const parsedDate = new Date(date)
    if (isDateValid(parsedDate)) {
        return parsedDate
    } else {
        fprint(`'${date}' ${messages.INVALID_LOG_DATE}`, messageType.ERROR)
    }
}

const logWork = async (startDate, endDate) => {
    const apiToken = await getClockifyApiToken()
    addUserApiKey(apiToken)
    const userWorkspaces = await findUserWorkspaces()
    const selectedWorkspace = await askForWorkspace(userWorkspaces)
    const response = await getWorkingTimeFromRange(selectedWorkspace.id, startDate, endDate, ["PROJECT", "DATE", "TIMEENTRY"])
    const parsedEntries = []
    response.groupOne.forEach(project => {
        project.children.forEach(dateEntry => {
            dateEntry.children.forEach(timeEntry => {
                const { seconds, minutes, hours, days } = secondsToTimeIntervals(timeEntry.duration)
                parsedEntries.push([
                    project.name,
                    dateEntry.name,
                    `${formatTimeString(days)} : ${formatTimeString(hours)} : ${formatTimeString(minutes)} : ${formatTimeString(seconds)}`,
                    timeEntry.name
                ])
            })
        })
    })
    createTable({
        header: ['project', 'date', 'duration', 'description'],
        content: parsedEntries
    })
}

module.exports = {
    logWork,
    parseLogEntry
}