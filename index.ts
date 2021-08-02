#!/usr/bin/env node
import core from './lib/core'
import minimist from 'minimist';

const args = minimist(process.argv)
const main = async () => {
  try {
    switch (args[0]) {
      case 'start':
      case 'go':
      case 'in':
        core.startWork(args)
        break
      case 'stop':
      case 'out':
      case 'quit':
      case 'exit':
      case 'end':
      case 'done':
        core.stopWork(args)
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
        core.logWork(args)
        break
      case 'import':
        core.importEntries(args[1])
        break
      case 'version':
        core.printVersion()
        break
      default:
        if (args.v || args.version) {
          core.printVersion()
        } else if (args.h || args.help) {
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
