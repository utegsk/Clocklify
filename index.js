const core = require('./lib/core')

let userProjects 
let userWorkspaces


const main = async () => {
  let token = await core.getClockifyApiToken() //look for api key or ask for it
  console.log(token)

  // console.log(workspace)
  // console.log(project)

}

main()
