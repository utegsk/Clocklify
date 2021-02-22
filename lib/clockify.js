import { get, request as _request } from 'https'


const config = {
    hostname: 'api.clockify.me',
    headers: {
        'Content-Type': 'application/json',
    }
}

// XuzX7wIY629W+HUv
const getClockifyApiToken = async () => {
    let token = credentials.get('api-key')
    if (!token) {
        response = await askForClockifyApiKey()
        credentials.set('api-key',response['apiKey'])
        token = response['apiKey']
    }
    addUserApiKey(token)
    return token
}

const getAllProjects = (workspaceId) => {
    return new Promise((resolve,reject) => {
        config.path = String.prototype.concat(`/api/v1/workspaces/${workspaceId}/projects`)
        config.method = 'GET'
        const req = get(config, (res) => {
            let body = ""
            res.on('data',(data) => {
                body += data
            })
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(body))
                } else {
                    reject("Something went wrong")
                }
            })
            req.on('error',(error) => {
                reject(error)
            })
        })
    })
},

const addUserApiKey = (key) => {
    config.headers['X-Api-Key'] = key
},

const findUserWorkspaces = () => {
    return new Promise((resolve,reject) => {
        config.path = String.prototype.concat('/api/v1/workspaces')
        config.method = 'GET'
        const req = get(config, res => {
            let body = ""
            res.on('data',(data) => {
                body += data
            })
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(body))
                } else {
                    reject("Something went wrong")
                }
            })
            res.on('error',(error) => {
                reject(error)
            })
        })
    })
},

const sendTimeEntries = (workspaceId,projectId,description,date) => {
    return new Promise((resolve, reject) => {
        config.path = String.prototype.concat(`/api/v1/workspaces/${workspaceId}/time-entries`)
        config.method = 'POST'
        let data = JSON.stringify({
            start: date.start,
            end: date.end,
            billable: true,
            description: description,
            projectId: projectId,
        })
        const request = _request(config, res => {
            let body = ""
            res.on('data',(data) => {
                body += data
            })
            res.on('error',(error) => {
                reject(error)
            })
            res.on('end', () => {
                if (res.statusCode === 201) {
                    resolve({
                        message: 'success',
                        data: body,
                        statusCode : res.statusCode
                    })
                } else {
                    resolve({
                        message: 'failure',
                        data: body,
                        statusCode : res.statusCode
                    })
                }
            })
        })
        
        request.write(data)
        request.end()
    })
}

export default {
    getClockifyApiToken,
    findUserWorkspaces,
    getAllProjects,
    sendTimeEntries
}