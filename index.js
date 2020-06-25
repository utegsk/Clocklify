const core = require('./lib/core')

let userProjects 
let userWorkspaces


const main = async () => {
  let token = core.getClockifyApiToken() //look for api key or ask for it
  // console.log(token)
  try{
    userWorkspaces = await core.getWorkSpacesAndProjects()
  }catch(error){
    console.error(error)
    process.exit() 
  }finally{
    //TODO refactor this to core.js
    let selectedWorkspace
    if(userWorkspaces.length === 1){
      selectedWorkspace = userWorkspaces[0].name
    }else{
      list = userWorkspaces.map(element => element.name)
      selectedWorkspace = await core.chooseWorkspace(list)
      selectedWorkspace = selectedWorkspace.workspace
    }
    let selectedProject
    let workspace = userWorkspaces.filter(element => element.name === selectedWorkspace)[0]
    if(workspace.projects.length === 1){

      selectedProject = workspace.projects[0].name
    }else{
      list = workspace.projects.map(element => element.name)
      selectedProject = await core.chooseProject(list)
      selectedProject = selectedProject.project
    }
    let project = workspace.projects.filter(project => project.name === selectedProject)[0]

    // console.log(workspace)
    // console.log(project)
  }

}

main()
