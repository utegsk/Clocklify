#!/usr/bin/env node

const core = require('./lib/core')

let userProjects 
let userWorkspaces


const main = async () => {
  let args = process.argv.slice(2)
  
  if(args.length === 1){
    switch(args[0]){
      case 'start':
        try{
          await core.getClockifyApiToken() //look for api key or ask for it
          let {project,workspace} = await core.askForProjectOnWorkspace() // look for all users workspaces and projects
          core.startWork(project,workspace)
          console.log(project)
        }catch(error){
          console.log(error)
        }
        break
      case 'stop':
        try{
          core.endWork();
        }catch(error){
          console.error(error)
        }
        break
    }
  }
  // console.log(workspace)
  // console.log(project)

}

main()
