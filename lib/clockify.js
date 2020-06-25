const https = require('https')
const package = require('../package.json')
const configStore = require('configstore')

const credentials = new configStore(package.name)

const config = {
    hostname: 'api.clockify.me',
    headers: {
        'Content-Type': 'application/json',
    }
}

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
}
  
