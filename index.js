#!/usr/bin/env node


var argv = require('minimist')(process.argv.slice(2));
var args = argv._
const core = require('./lib/core')

const main = async () => {

  switch(args[0]){
    case 'start':
      try{
        if (argv.t) {
          core.startWork(argv.t)
        } else {
          core.startWork(-1);
        }
      }catch(error){
        console.error(error.message)
        process.exit()
      }
    break
    case 'stop':
    case 'end' :
      try{
        await core.getClockifyApiToken()
        core.checkWork()
        let {project,workspace} = await core.askForProjectAndWorkspace()
        core.endWork(workspace.id,project.id)
      }catch(error){
        console.error(error.message)
        process.exit()
      }
    break
    case 'remove':
      try{
        core.deleteWork()
      }catch(error){
        console.error(error.message)
        process.exit()
      }
    break
    case 'status':
      core.workStatus()
    break
    case 'help':
      core.help()
    break
    case 'log':
      try{
        if(args.length === 2){
          core.checkFileAndSendRequest(args[1])
        }else if(args.length === 3){
          core.logWork(args[1], args[2])
        }
      }catch(error){
        console.error(error.message)
        process.exit()
      }
    break
    case 'version':
      core.printVersion()
    break
    default:
      core.wrongArgument(args[0])
    break
  }
}

main()
