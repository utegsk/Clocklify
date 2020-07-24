const https = require('https')

const config = {
    hostname: 'api.clockify.me',
    headers: {
        'Content-Type': 'application/json',
    }
}
// XuzX7wIY629W+HUv
module.exports = {
    getAllProjects: (workspaceId) => {
        return new Promise((resolve,reject) => {
            config.path = String.prototype.concat(`/api/v1/workspaces/${workspaceId}/projects`)
            config.method = 'GET'
            const req = https.get(config, (res) => {
                let body = ""
                res.on('data',(data) => {
                    body += data
                })
                res.on('end', () => {
                    if(res.statusCode === 200){
                        resolve(JSON.parse(body))
                    }else{
                        reject("Something went wrong")
                    }
                })
                req.on('error',(error) => {
                    reject(error)
                })
            })
        })
    },
    addUserApiKey(key){
        config.headers['X-Api-Key'] = key
    },
    findUserWorkspaces(){
        return new Promise((resolve,reject) => {
            config.path = String.prototype.concat('/api/v1/workspaces')
            config.method = 'GET'
            const req = https.get(config, res => {
                let body = ""
                res.on('data',(data) => {
                    body += data
                })
                res.on('end', () => {
                    if(res.statusCode === 200){
                        resolve(JSON.parse(body))
                    }else{
                        reject("Something went wrong")
                    }
                })
                res.on('error',(error) => {
                    reject(error)
                })
            })
        })
    },
    sendTimeEntries(workspaceId,projectId,description,date){
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
            const request = https.request(config, res => {
                let body = ""
                res.on('data',(data) => {
                    body += data
                })
                res.on('error',(error) => {
                    reject(error)
                })
                res.on('end', () => {
                    if(res.statusCode === 201){
                        resolve({
                            message: 'success',
                            data: body,
                            statusCode : res.statusCode
                        })
                    }else{
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
}
  
