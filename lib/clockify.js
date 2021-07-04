const https = require('https')
const { get: getFromStorage, set: setToStorage } = require('./storage')
const questions = require('./questions')


const config = {
  hostname: 'api.clockify.me',
  headers: {
    'Content-Type': 'application/json',
    'X-Api-Key': getFromStorage('api-key'),
  },
}

const getClockifyApiToken = async (promptNew = false) => {
  if (process.env.TOKEN) {
    setToStorage('api-key', process.env.TOKEN)
  }
  let token = getFromStorage('api-key')
  if (promptNew) {
    token = null
  }
  if (!token) {
    let response = await questions.askForClockifyApiKey()
    setToStorage('api-key', response['apiKey'])
    token = response['apiKey']
  }
  addUserApiKey(token)
  return token
}

const getAllProjects = (workspaceId) => {
  return new Promise((resolve, reject) => {
    config.path = String.prototype.concat(`/api/v1/workspaces/${workspaceId}/projects`)
    config.method = 'GET'
    const req = https.get(config, (res) => {
      let body = ''
      res.on('data', (data) => {
        body += data
      })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body))
        } else {
          reject('Something went wrong')
        }
      })
      req.on('error', (error) => {
        reject(error)
      })
    })
  })
}

const addUserApiKey = (key) => {
  config.headers['X-Api-Key'] = key
}

const getUsersInfo = () => {
  return new Promise((resolve, reject) => {
    config.path = String.prototype.concat('/api/v1/user')
    config.method = 'GET'
    const req = https.get(config, res => {
      let body = ''
      res.on('data', (data) => {
        body += data
      })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body))
        } else {
          reject(res.statusCode)
        }
      })
      res.on('error', (error) => {
        reject(error)
      })
    })
  })
}

const findUserWorkspaces = () => {
  return new Promise((resolve, reject) => {
    config.path = String.prototype.concat('/api/v1/workspaces')
    config.method = 'GET'
    const req = https.get(config, res => {
      let body = ''
      res.on('data', (data) => {
        body += data
      })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body))
        } else {
          reject(res.statusCode)
        }
      })
      res.on('error', (error) => {
        reject(error)
      })
    })
  })
}

const getWorkSpacesAndProjects = async () => {
  return new Promise((resolve, reject) => {
    let workspaces
    findUserWorkspaces().then(response => {
      workspaces = response
      // console.log('workspaces', workspaces)
      workspaces.forEach((workspace, index) => {
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

const getWorkingTimeFromRange = async (workspaceId, start, end, filterGroups) => {
  let user = await getFromStorage('user')
  // console.log('id', user)
  if (!user) {
    user = await getUsersInfo()
    await setToStorage('user', { id: user.id })
  }

  return new Promise((resolve, reject) => {
    config.hostname = 'reports.api.clockify.me'
    config.path = String.prototype.concat(`/v1/workspaces/${workspaceId}/reports/summary`)
    config.method = 'POST'
    const data = JSON.stringify({
      dateRangeStart: start,
      dateRangeEnd: end,
      summaryFilter: {
        groups: filterGroups,
      },
      users: {
        ids: [user.id]
      },
      amountShown: "HIDE_AMOUNT"
    })
    const request = https.request(config, (res) => {
      let body = ''
      res.on('data', (data) => {
        body += data
      })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(body))
        } else {
          reject('Something went wrong')
        }
      })
      res.on('error', (error) => {
        reject(error)
      })
    })

    request.write(data)
    request.end()
  })
}

const sendTimeEntries = (workspaceId, projectId, description, date) => {
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
      let body = ''
      res.on('data', (data) => {
        body += data
      })
      res.on('error', (error) => {
        reject(error)
      })
      res.on('end', () => {
        if (res.statusCode === 201) {
          resolve({
            message: 'success',
            data: body,
            statusCode: res.statusCode,
          })
        } else {
          resolve({
            message: 'failure',
            data: body,
            statusCode: res.statusCode,
          })
        }
      })
    })

    request.write(data)
    request.end()
  })
}

module.exports = {
  getWorkSpacesAndProjects,
  getClockifyApiToken,
  getWorkingTimeFromRange,
  sendTimeEntries,
  addUserApiKey,
  findUserWorkspaces,
}
