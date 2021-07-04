const mainPackage = require('../package.json')
const configStore = require('configstore')
const credentials = new configStore(mainPackage.name)

const get = (key) => {
  return credentials.get(key)
}

const set = (key, value) => {
  credentials.set(key, value)
  return get(value)
}

const remove = (key) => {
  const value = get(key)
  credentials.delete(key)
  return value != null
}

module.exports = {
  get,
  set,
  remove
}
