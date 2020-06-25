const core = require('./lib/core')

let userProjects 
let userWorkspaces


const main = async () => {
  let selectedWorkspace = await core.chooseWorkspace()
  console.log(selectedWorkspace)
  // let token = core.getClockifyApiToken() //look for api key or ask for it
  // console.log(token)
  // userWorkspaces = await core.getWorkSpacesAndProjects()
  // console.log("fuck", userWorkspaces)
  // clockify.findUserWorkspaces().then((response) => {
  //   userWorkspaces = response
  //   console.log(response)
  //   clockify.getAllProjects(userWorkspaces[0].id).then((response) => {
  //     userProjects = response
  //     console.log(response);
  //   }).catch((error) => {
  //     console.error(error)
  //   })
  // }).catch((error) => {
  //   console.error(error)
  // })
}

main()
