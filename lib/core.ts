import mainPackage from '../package.json'
import configStore from 'configstore'
import helpPackage = require('./help.json')
import messages = require('./messages.json')
import utils = require('./utils')
import work = require('./modules/work')
import imp = require('./modules/import')
import pause = require('./modules/break')
import goal = require('./modules/goal')
import log = require('./modules/log')
const credentials = new configStore(mainPackage.name)


const startWork = (argv) => {
  let startDate
  if (argv.t) {
    startDate = utils.parseDateFromTimeEntry(argv.t)
    if (!utils.isDateValid(startDate)) {
      invalidFlagUsage('t')
      return
    } else if (!utils.isDateBefore(startDate, new Date())) {
      utils.fprint(messages.WRONG_TIME_ENTRY_OVER, utils.messageType.ERROR)
      return
    }
  } else {
    startDate = new Date()
  }
  work.start(startDate)
}

const stopWork = (argv) => {
  let endDate
  const _work = credentials.get('work')
  if (argv.t && argv.d) {
    incompatibleFlagUsage(['t', 'd'])
    return
  } else if (argv.t) {
    endDate = utils.parseDateFromTimeEntry(argv.t)
    if (!utils.isDateValid(endDate)) {
      invalidFlagUsage('t')
      return
    } else if (!utils.isDateBefore(endDate, new Date())) {
      utils.fprint(messages.WRONG_TIME_ENTRY_OVER, utils.messageType.ERROR)
      return
    } else if (!utils.isDateBefore(new Date(_work.startDate), endDate)) {
      console.log('time', _work.startDate, endDate)
      utils.fprint(messages.WRONG_TIME_ENTRY_END_BEFORE_START, utils.messageType.ERROR)
      return
    }
  } else if (argv.d) {
    if (argv.d === true) {
      work.dump()
    } else {
      invalidFlagUsage('d')
    }
    return
  }

  if (_work) {
    let _break = credentials.get('break')
    if (_break.startAt) {
      pause.stop(_break)
    }
    utils.fprint(`Length of work: ${work.workLengthString(_work.startDate)}`, utils.messageType.INFO)
    work.stop(_work, _break, endDate, false)
  } else {
    utils.fprint(messages.NO_WORK_IN_PROGRESS, utils.messageType.WARNING)
  }
}

const toggleBreak = () => {
  let _break = credentials.get('break')
  if (credentials.get('work')) {
    if (_break.startAt) {
      pause.stop(_break)
    } else {
      pause.start(_break)
    }
  } else {
    utils.fprint(messages.NO_WORK_IN_PROGRESS, utils.messageType.WARNING)
  }
}

const workStatus = () => work.status()

const monthGoal = (arg: string) => {
  let _goal = credentials.get('goal')
  if (!_goal) {
    _goal = { active: false, workspaces: [] }
    credentials.set('goal', _goal)
  }
  switch (arg) {
    case 'on':
      return goal.on(_goal)
    case 'off':
      return goal.off(_goal)
    case 'set':
      return goal.set()
    case 'status':
      return goal.status(_goal)
    default:
      unknownArgument(arg)
  }
}

const logActualMonth = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0)
  log.logWork(start, now)
}

const logWork = (args: any) => {
  if (args.m && args.l) {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0)
    const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    log.logWork(start, end)
  } else if (args.m) {
    logActualMonth()
  } else if (args._.length === 3) {
    log.logWork(log.parseLogEntry(args._[1]), log.parseLogEntry(args._[2]))
  } else {
    logActualMonth()
  }
}

const importEntries = (filePath: string) => imp.importTimeEntries(filePath)

const help = () => {
  const list = ({ label, entries }) => {
    const offset = 1
    console.log('    ' + label + ' :')
    const longestCommandKeyLength = Math.max(...Object.keys(entries).map(key => key.length)) + offset
    Object.entries(entries).forEach(([key, value]) => {
      if (typeof value === 'object') {
        console.log('         ' + key)
        const longestCommandKeyLength = Math.max(...Object.keys(value).map(key => key.length)) + offset
        Object.entries(value).forEach(([key, value]) => {
          console.log('            ' + utils.fillWith(key, longestCommandKeyLength) + value)
        })
      } else {
        console.log('        ' + utils.fillWith(key, longestCommandKeyLength) + value)
      }
    })
    console.log()
  }

  console.log()
  console.log(helpPackage.packageName)
  list({ label: helpPackage.usage, entries: helpPackage.usageExample })
  list({ label: helpPackage.commandOptionsLabel, entries: helpPackage.commands })
  list({ label: helpPackage.flagOptionsLabel, entries: helpPackage.flags })
}
const adviceHelp = () => {
  utils.fprint(`Run -h or -help for more info.`, utils.messageType.INFO)
}

const printVersion = () => utils.fprint(`v${mainPackage.version}`, utils.messageType.SIMPLE)

const unknownArgument = (argument: string) => {
  if (argument != null) {
    utils.fprint(`Argument '${argument}' not recognized.`, utils.messageType.ERROR)
    adviceHelp()
  } else {
    help()
  }
}

const invalidFlagUsage = (flag: string) => {
  utils.fprint(`Invalid '-${flag}' flag usage.`, utils.messageType.ERROR)
  adviceHelp()
}

const incompatibleFlagUsage = (flags: string[]) => {
  utils.fprint(`Incompatible '-${flags.join(', -')}' flag usage.`, utils.messageType.ERROR)
  adviceHelp()
}


export = {
  startWork,       // starts work
  stopWork,        // stops work
  toggleBreak,     // toggles break status
  workStatus,      // prints work's status
  monthGoal,       // toggle month goal
  logWork,         // prints work entries between the entered dates
  importEntries,   // imports time entries
  help,            // prints help
  printVersion,    // print version of Clocklify to terminal
  unknownArgument, // print 'wrong argument' to terminal
}
