'use strict'
const aws = require('aws-sdk')
const _h = require('../_helpers')
const lambda = new aws.Lambda()

const EVENTIVALBADGEWHITELIST = [
  'MANAGEMENT',
  'JURY',
  'INDUSTRY ACCESS',
  'INDUSTRY PRO',
  'GUEST',
  'STAFF',
  'VOLUNTEER'
]


module.exports.handler = async (event) => {
  console.log('event ', event)
  console.log(_h.getUserId(event))
  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
    region: 'eu-central-1'
  })
  
  const params = {
    AccessToken: ((event.headers.authorization).split(' '))[1] /* required */
  }
  const userDetails = await cognitoidentityserviceprovider.getUser(params).promise()
  
  
  console.log('userDetail ', userDetails)
  const userProfile = {
    username: userDetails.Username,
  }

  for (const item of userDetails.UserAttributes) {
    userProfile[item.Name] = item.Value
  }
  
  
  if (event.headers.origin === 'http://localhost:4000'){

    const industryProfile = {
      username: userProfile.username,
      profile_filled: true
    } 
    
    if (userProfile.identities){
    userProfile.identities = JSON.parse(userProfile.identities)
    }

    industryProfile.industryAccessLevel = false

    try{
      console.log('userDetails.identities ', userProfile.identities)
      const is_eventival_user = userProfile.identities && userProfile.identities.filter(id => id.providerName === 'Eventival').length > 0
      console.log('is_eventival_user ', is_eventival_user)
    
      if (is_eventival_user) {
        let lambdaParams4 = {
          FunctionName: 'prod3-poff-api-eventival-getBadges',
          Payload: JSON.stringify({
            email: userProfile.email,
            headers: { authorization: ((event.headers.authorization).split(' '))[1] }
          })
        }
        
        console.log('eventivalLambdaParams ', lambdaParams4)
        let _response = await lambda.invoke(lambdaParams4).promise()
        console.log(_response)
        const _responseJson = JSON.parse(_response.Payload)
        console.log(_responseJson)
        industryProfile.eventivalProfile = _responseJson.response.body
        industryProfile.name = _responseJson.response.body.name
    
        industryProfile.industryAccessLevel = industryProfile.eventivalProfile.badges.filter(badge => {
          console.log({badge});
          if (!EVENTIVALBADGEWHITELIST.includes(badge.type.toUpperCase())) {
            return false
          }
    
          let from = new Date(badge.valid.from).getTime()
          let now = new Date().getTime()
          let to = new Date(badge.valid.to).getTime()
          if (now < from || to < now){
            return false
          }
    
          return true
        }).length > 0
      }
    } catch(err){
      console.log(err)
    }
  console.log('local')

  return industryProfile
}

  userProfile.shortlist = await getShortlist(event)
  userProfile.savedscreenings = await getSavedScreenings(event)
  userProfile.userpasses = await getUserPasses(event)

  




  if (userProfile.phone_number) {
    userProfile.phone_number = userProfile.phone_number.replace('+', '')
  }

  // profiil täidetud
  if ('birthdate' in userProfile && 'email' in userProfile && 'address' in userProfile && 'family_name' in userProfile && 'name' in userProfile && 'gender' in userProfile && 'phone_number' in userProfile) {
    userProfile.profile_filled = true
    // registreerinud aga profiil täitmata
  } else if ('email' in userProfile && 'family_name' in userProfile && 'name' in userProfile) {
    userProfile.profile_filled = false
  }

  console.log('frondi versioon profiilist')
  console.log(userProfile)

  return userProfile
}


async function getUserPasses(event) {
  var lambdaParams3 = {
    FunctionName: 'prod3-poff-api-product-get',
    Payload: JSON.stringify({
      headers: { authorization: ((event.headers.authorization).split(' '))[1] }
    })
  }
  console.log('invokeParams ', lambdaParams3)

  const lambdaResponse3 = await lambda.invoke(lambdaParams3).promise()
  console.log('lambdaResponse ', lambdaResponse3)

  const userpasses = JSON.parse(lambdaResponse3.Payload)

  console.log('userpasses ', userpasses)
  return userpasses
}

async function getSavedScreenings(event) {
  var lambdaParams2 = {
    FunctionName: 'prod3-poff-api-favourite-get',
    Payload: JSON.stringify({
      table: 'prod-poff-savedscreenings',
      headers: { authorization: ((event.headers.authorization).split(' '))[1] }
    })
  }
  console.log('invokeParams ', lambdaParams2)

  const lambdaResponse2 = await lambda.invoke(lambdaParams2).promise()
  console.log('lambdaResponse ', lambdaResponse2)

  const savedscreenings = JSON.parse(lambdaResponse2.Payload)

  console.log('savedscreenings ', savedscreenings)
  return savedscreenings
}

async function getShortlist(event) {
  var lambdaParams = {
    FunctionName: 'prod3-poff-api-favourite-get',
    Payload: JSON.stringify({
      table: 'prod-poff-favourite',
      headers: { authorization: ((event.headers.authorization).split(' '))[1] }
    })
  }
  console.log('invokeParams ', lambdaParams)

  const lambdaResponse = await lambda.invoke(lambdaParams).promise()
  console.log('lambdaResponse ', lambdaResponse)

  const shortlist = JSON.parse(lambdaResponse.Payload).map(id => {
    return { cassette_id: id }
  })
  console.log('shortlist ', shortlist)
  return shortlist
}




