const mainPackage = require('../package.json')
const configStore = require('configstore')
const helpPackage = require('./help.json')
const messages = require('./messages.json')
const utils = require('./utils')
const work = require('./modules/work')
const imp = require('./modules/import')
const pause = require('./modules/break')
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

const workStatus = () => work.status()
const deleteWork = () => work.dump()
const logWork = (from, to) => {
  // work.log(from, to)
  utils.fprint(messages.COMING_SOON, utils.messageType.INFO)
}
const importEntries = () => imp.importTimeEntries()

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
  deleteWork,      // check if there is work and detele its
  workStatus,      // prints work's status
  logWork,         // create work entrie from past with start and end dates
  importEntries,   // imports time entries
  help,            // prints help
  printVersion,    // print version of uteg-cli to terminal
  unknownArgument, // print 'wrong argument' to terminal
}
