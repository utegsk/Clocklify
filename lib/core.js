const mainPackage = require('../package.json')
const configStore = require('configstore')
const helpPackage = require('./help.json')
const messages = require('./messages.json')
const utils = require('./utils')
const work = require('./modules/work')
const imp = require('./modules/import')
const pause = require('./modules/break')
const goal = require('./modules/goal')
const log = require('./modules/log')
const credentials = new configStore(mainPackage.name)


const startWork = (argv) => work.start(argv.t != null ? argv.t : -1)

const stopWork = () => {
  const _work = credentials.get('work')
  if (_work) {
    let _break = credentials.get('break')
    if (_break.startAt) {
      pause.stop(_break)
    }
    utils.fprint(`Length of work: ${work.workLengthString(_work.startDate)}`, utils.messageType.INFO)
    work.stop(_work, _break, null, false)
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

const deleteWork = () => work.dump()
const workStatus = () => work.status()

const monthGoal = (arg) => {
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

const logWork = (from, to) => {
  log.logWork(from, to)
  utils.fprint(messages.COMING_SOON, utils.messageType.INFO)
}

const importEntries = (filePath) => imp.importTimeEntries(filePath)

const help = () => {
  console.log(helpPackage.packageName)
  console.log('   ' + helpPackage.usage)
  console.log('       ' + helpPackage.usageExample)
  console.log('')
  Object.entries(helpPackage.commands).forEach(([key, value]) => {
    console.log(`   ${key} -> ${value}`)
  })
}

const printVersion = () => utils.fprint(`v${mainPackage.version}`, utils.messageType.SIMPLE)

const unknownArgument = (argument) => {
  if (argument != null) {
    utils.fprint(`argument '${argument}' not recognized`, utils.messageType.ERROR)
  }
  help()
}


module.exports = {
  startWork,       // starts work
  stopWork,        // stops work
  toggleBreak,     // toggles break status
  deleteWork,      // check if there is work and delete its
  workStatus,      // prints work's status
  monthGoal,       // toggle month goal
  logWork,         // prints work entries between the entered dates
  importEntries,   // imports time entries
  help,            // prints help
  printVersion,    // print version of Clocklify to terminal
  unknownArgument, // print 'wrong argument' to terminal
}
