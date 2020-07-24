#!/usr/bin/env node

const core = require('./lib/core')

const main = async () => {
  let args = process.argv.slice(2)
  
  switch(args[0]){
    case 'start':
      try{
        core.startWork()
      }catch(error){
        console.error(error.message)
        process.exit()
      }
    break
    case 'stop':
    case 'end' :
      try{
        await core.getClockifyApiToken() //look for api key or ask for it
        core.checkWork() // check if there is work and pring lenght string
        let {project,workspace} = await core.askForProjectOnWorkspace() // look for all users workspaces and projects
        core.endWork(workspace.id,project.id) // end work and send request to clockify api than delete work
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
    default:
      core.wrongArgument(args[0])
    break
  }
}

main()
