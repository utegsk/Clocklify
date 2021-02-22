import { name, version } from '../package.json'
import { fprint, messageType } from 'utils'
import configStore from 'configstore'
import { start, stop, log, status, dump } from 'modules/work'
import { importTimeEntries } from 'modules/import'
import { start as startBreak, stop as stopBreak } from 'modules/break'
import { askForProjectAndWorkspace, getClockifyApiToken } from 'questions'
import { packageName, usage, usageExample, commands } from './help.json'

const credentials = new configStore(name)

const NO_WORK_IN_PROGRESS = "[WORK] No work in progress"
const NO_START_DATE = "[WORK] Couldn't find start date of work"
const LUNCH_IN_PROGRESS = "[LUNCH] Lunch break wasn't stopped"


const startWork = (argv) => start(argv.t != null ? argv.t:-1)

const stopWork = async () => {
  await getClockifyApiToken()

  let work = credentials.get('work')
  if (work) {
      if (work.lunchStart) {
          if (!work.lunchEnd) {
              throw new Error(LUNCH_IN_PROGRESS)
          }
      }
      workLengthString(work.startDate)
  } else {
      throw new Error(NO_WORK_IN_PROGRESS)
  }

  let { project, workspace } = await askForProjectAndWorkspace()
  stop(workspace.id, project.id)
}

const toggleBreak = () => {
  startBreak()
  stopBreak()
}

const workStatus = () => status()
const deleteWork = () => dump()
const logWork = () => log()
const importEntries = () => importTimeEntries()

const help = () => {
  console.log(packageName)
  console.log("   " + usage)
  console.log("       " + usageExample)
  console.log("")
  Object.entries(commands).forEach(([key,value]) => {
      console.log(`   ${key} -> ${value}`)
  })
}

const printVersion = () => fprint(`v${version}`, messageType.SIMPLE)

const unknownArgument = (argument) => {
  if(argument != null){
    fprint(`argument '${argument}' not recognized`, messageType.ERROR)
  }
  help()
}


export default {
  startWork,       // starts work
  stopWork,        // stops work
  toggleBreak,     // toggles break status
  deleteWork,      // check if there is work and detele its
  workStatus,      // prints work's status
  logWork,         // create work entrie from past with start and end dates
  importEntries,   // imports time entries
  help,            // prints help
  printVersion,    // print version of uteg-cli to terminal
  unknownArgument, // print 'wrong argument' to terminal
}
