const Hubspot = require('hubspot')
const userProperties = require('./userProperties')

class LGHubspot extends Hubspot {
  constructor (options = {}) {
    super(options)
    this.activeLearnersListId = options.activeLearnersListId
    this.on('apiCall', request => {
      console.log('API CALL', request.method, request.url)
    })
  }

  // loads all contacts via batch requests
  getAllContacts(callback){
    const contacts = []
    const onResponse = (error, response) => {
      if (error) {
        callback(error)
        return
      }
      contacts.push(...response.contacts)
      if (response['has-more']){
        this.getContactsBatch(response['vid-offset'], onResponse)
      }else{
        callback(null, contacts.map(processContact))
      }
    }
    this.getContactsBatch(null, onResponse)
  }

  getContactsBatch(vidOffset, callback){
    this.contacts.get({
      count: 99999,
      vidOffset: vidOffset,
      propertyMode: 'value_only',
      formSubmissionMode: 'none',
      showListMemberships: false,
      property: Object.keys(userProperties)
    }, callback)
  }

  getActiveLearners(callback){
    this.lists.getContacts(2597, {
      count: 99999,
      propertyMode: 'value_only',
      formSubmissionMode: 'none',
      showListMemberships: false,
      property: Object.keys(userProperties)
    }, (error, response) => {
      if (error){
        callback(error)
        return
      }
      console.log('response', response)
      const contacts = response.contacts.map(processContact)
      callback(error, contacts)
    })
  }

}


module.exports = LGHubspot


const processContact = _contact => {
  const contact = {}
  contact.vid = _contact.vid
  contact['profile-url'] = _contact['profile-url']

  Object.entries(userProperties).forEach(([propName, propType]) => {
    const prop = _contact.properties[propName]
    if (!prop) {
      contact[propName] = null
      return
    }
    let value = prop.value

    if (propType === 'String' && typeof value !== 'string')
      value = String(value)

    if (propType === 'Number' && typeof value !== 'number')
      value = Number(value)

    if (propType === 'Boolean' && typeof value === 'string')
      value = value === 'true' ? true : value === 'false' ? false : null

    if (propType === 'Date' && !(value instanceof Date))
      value = parseDate(value)

    if (propType === 'Phase' && typeof value !== 'number')
      value = Number.parseInt(value.replace('Phase ',''))

    contact[propName] = value
  })

  return contact
}

const parseDate = input => {
  let date
  if (input.toString().match(/^\d+$/)){
    date = new Date(0)
    date.setUTCSeconds(Number.parseInt(input) / 1000)
    return date
  }
}
