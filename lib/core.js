const mainPackage = require('../package.json')
const helpPackage = require('./help.json')
const messages = require('./messages.json')
const utils = require('./utils')
const work = require('./modules/work')
const imp = require('./modules/import')
const pause = require('./modules/break')


const startWork = (argv) => work.start(argv.t != null ? argv.t : -1)

const stopWork = async () => work.stop()

const toggleBreak = () => {
  pause.start()
  pause.stop()
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
