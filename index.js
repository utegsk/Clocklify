#!/usr/bin/env node
require('dotenv').config()
const core = require('./lib/core.js');
const argv = require('minimist')(process.argv.slice(2));
const args = argv._;


const main = async () => {
  try {
    switch (args[0]) {
      case 'start':
      case 'go':
      case 'in':
        core.startWork(argv)
        break
      case 'stop':
      case 'out':
      case 'quit':
      case 'exit':
      case 'end':
      case 'done':
        core.stopWork(argv)
        break
      case 'break':
      case 'pause':
      case 'lunch':
        core.toggleBreak()
        break
      case 'status':
        core.workStatus()
        break
      case 'goal':
        await core.monthGoal(args[1])
        break
      case 'help':
        core.help()
        break
      case 'log':
        core.logWork(argv)
        break
      case 'import':
        core.importEntries(args[1])
        break
      case 'version':
        core.printVersion()
        break
      default:
        if (argv.v || argv.version) {
          core.printVersion()
        } else if (argv.h || argv.help) {
          core.help()
        } else {
          core.unknownArgument(args[0])
        }
    }
  } catch (error) {
    console.error(error.message)
    process.exit()
  }
}

main()
