// promts user to choose between multiple options
import { chooseProject, chooseWorkspace } from 'questions'
import { findUserWorkspaces, getAllProjects } from 'clockify'


const getWorkSpacesAndProjects = async () => {
    return new Promise((resolve, reject) => {
        let workspaces
        findUserWorkspaces().then(response => {
            workspaces = response
            workspaces.forEach((workspace,index)=> {
                getAllProjects(workspace.id).then(projects => {
                    workspaces[index]['projects'] = projects
                    resolve(workspaces)
                }).catch(error => {
                    reject(error)
                })
            })
        }).catch(error => {
            reject(error)
        })
    })
}

const chooseWorkspace = async (list) => {
    let workspace = await chooseWorkspace(list)
    return workspace
}

const chooseProject = async (list) => {
    let project = await chooseProject(list)
    return project
}

const askForProjectAndWorkspace = async() => {
    let userWorkspaces = await getWorkSpacesAndProjects()
    let selectedWorkspace
    if (userWorkspaces.length === 1) {
        selectedWorkspace = userWorkspaces[0].name
    } else {
        list = userWorkspaces.map(element => element.name)
        selectedWorkspace = await chooseWorkspace(list)
        selectedWorkspace = selectedWorkspace.workspace
    }
    let selectedProject
    let workspace = userWorkspaces.filter(element => element.name === selectedWorkspace)[0]
    if (workspace.projects.length === 1) {
        selectedProject = workspace.projects[0].name
    } else {
        list = workspace.projects.map(element => element.name)
        selectedProject = await chooseProject(list)
        selectedProject = selectedProject.project
    }
    let project = workspace.projects.filter(project => project.name === selectedProject)[0]
    return { project, workspace }
}


export default {
    askForProjectAndWorkspace
}