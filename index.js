require('dotenv').load()
const LGHubspot = require('./LGHubspot')


const connectToHubspot = environment => {
  const apiKeyEnvironmentVariableName = `${environment}_HUBSPOT_API_KEY`
  const activeLearnersListIdEnvironmentVariableName = `${environment}_ACTIVE_LEARNERS_LIST_ID`
  const apiKey = process.env[apiKeyEnvironmentVariableName]
  const activeLearnersListId = process.env[activeLearnersListIdEnvironmentVariableName]
  if (!apiKey) throw new Error(`${apiKeyEnvironmentVariableName} must be set`)
  if (!activeLearnersListId) throw new Error(`${activeLearnersListIdEnvironmentVariableName} must be set`)
  return new LGHubspot({ apiKey })
}

const productionHubspot = connectToHubspot('PRODUCTION')
const developmentHubspot = connectToHubspot('DEVELOPMENT')


// productionHubspot.getAllContacts((error, contacts) => {
//   if (error){
//     console.error(error)
//   }else{
//     console.log(`loaded ${contacts.length} contacts`)
//     console.log(contacts.map(c => c.email))
//   }
// })

productionHubspot.getActiveLearners((error, learners) => {
  if (error){
    console.error(error)
  }else{
    console.log(`loaded ${learners.length} learners`)
    console.log(learners.map(c => c.email))
  }
})
