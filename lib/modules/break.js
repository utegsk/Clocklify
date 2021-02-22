const credentials = new configStore(package.name)

const START_BREAK = "Break has started"
const STOP_BREAK = "Break has stopped"
const NO_BREAK_IN_PROGRESS = "No brake in progress"


const start = () => {
    let work = credentials.get('work')
    if (work) {
        if (!work.lunchStart) {
            now = new Date()
            credentials.set('work',{...work, lunchStart: now.toUTCString()})
            console.log(START_BREAK + ' at', now.toLocaleTimeString())
            // TODO: place for Slack and Github api call
        } else {
            throw new Error(NO_BREAK_IN_PROGRESS)
        }
    } else {
        throw new Error(NO_WORK_IN_PROGRESS)
    }
}

const stop = () => {
    let work = credentials.get('work')
    if (work) {
        if (work.lunchStart) {
            if (!work.lunchEnd) {
                now = new Date()
                credentials.set('work',{...work,lunchEnd: now.toUTCString()})
                console.log(STOP_BREAK + ' at', now.toLocaleTimeString())
                // TODO: place for Slack and Github api call
            } else {
                throw new Error(STOP_BREAK)
            }
        } else {
            throw new Error(NO_BREAK_IN_PROGRESS)
        }
    } else {
        throw new Error(NO_WORK_IN_PROGRESS)
    }
}

export default {
    start, // starts a break and changes working status on Slack/Github to "Lunch Time"
    stop    // ends the running break and changes working status back to "Busy"
}