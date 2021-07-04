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
    let sum = 0
    response.groupOne.forEach(project => {
        project.children.forEach(dateEntry => {
            dateEntry.children.forEach(timeEntry => {
                const { seconds, minutes, hours, days } = secondsToTimeIntervals(timeEntry.duration)
                sum += timeEntry.duration
                const formatedSeconds = seconds > 0 && minutes < 1 ? `${formatTimeString(seconds)} sec.` : ''
                const formatedMinutes = minutes > 0 ? `${formatTimeString(minutes)} min.` : ''
                const formatedHours = hours > 0 ? `${formatTimeString(hours)} h.` : ''
                const formatedDays = days > 0 ? `${formatTimeString(days)} d.` : ''
                parsedEntries.push([
                    project.name,
                    dateEntry.name,
                    `${formatedDays} ${formatedHours} ${formatedMinutes} ${formatedSeconds}`.trim(),
                    timeEntry.name
                ])
            })
        })
    })
    const { minutes, hours, days } = secondsToTimeIntervals(sum)
    const formatedMinutes = minutes > 0 ? `${formatTimeString(minutes)} min.` : ''
    const formatedHours = hours > 0 ? `${formatTimeString(hours + days * 24)} h.` : ''
    const sumString = `${formatedHours} ${formatedMinutes}`.trim()
    createTable({
        header: ['project', 'date', 'duration', 'description'],
        content: parsedEntries,
        footer: ['SUM', '', sumString, '']
    })
}

module.exports = {
    logWork,
    parseLogEntry
}