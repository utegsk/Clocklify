#!/usr/bin/env node
import { 
  startWork,
  stopWork,
  toggleBreak,
  deleteWork,
  workStatus,
  help,
  importEntries,
  logWork,
  printVersion,
  unknownArgument
} from './lib/core';

var argv = require('minimist')(process.argv.slice(2));
var args = argv._


const main = async () => {
  try {
    switch(args[0]) {
      case 'start':
      case 'in'   :
        startWork(argv)
        break
      case 'stop':
      case 'out' :
      case 'quit':
      case 'exit':
      case 'end' :
        stopWork()    
        break
      case 'break':
      case 'pause':
      case 'lunch':
        toggleBreak()
        break
      case 'remove':
      case 'throw':
      case 'dump':
        deleteWork()
        break
      case 'status':
        workStatus()
        break
      case 'help':
        help()
        break
      case 'log':
        logWork(args[1], args[2])
        break
      case 'import':
        importEntries(args[1])
        break
      case 'version':
        printVersion()
        break
      default:
        unknownArgument(args[0])
    }
  } catch(error) {
    console.error(error.message)
    process.exit()
  }
}

main()
