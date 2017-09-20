require('dotenv').load()
const Hubspot = require('hubspot')
const userProperties = require('./userProperties')

const connectToHubspot = environmentVariable => {
  const apiKey = process.env[environmentVariable]
  if (!apiKey)
    throw new Error(`${environmentVariable} must be set`)
  return new Hubspot({ apiKey })
}

const productionHubspot = connectToHubspot('PRODUCTION_HUBSPOT_API_KEY')
const developmentHubspot = connectToHubspot('DEVELOPMENT_HUBSPOT_API_KEY')


productionHubspot.contacts.get({
  count: 100,
  // vidOffset:
  propertyMode: 'value_only',
  formSubmissionMode: 'none',
  showListMemberships: false,
  property: Object.keys(userProperties)
}, (error, response) => {
  console.log('production contacts', error)
  if (response && response.contacts) {
    const contacts = response.contacts.map(processContact)
    console.log(JSON.stringify(contacts, null, 2))
  }
})

const processContact = _contact => {
  const contact = {}
  contact.vid = _contact.vid
  contact['profile-url'] = _contact['profile-url']

  Object.entries(userProperties).forEach(([prop, type]) => {
    contact[prop] = prop in _contact.properties
      ? _contact.properties[prop].value
      : null
  })
  // delete contact.properties
  // delete contact["identity-profiles"]
  // delete contact["form-submissions"]
  return contact
}

// const connectToHubspot

// hubspot.useKey(process.env.HUBSPOT_API_KEY, (error) => {
//   if (error) throw error
// });
