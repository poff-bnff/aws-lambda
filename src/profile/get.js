'use strict'
const aws = require('aws-sdk')
const _h = require('../_helpers')
const lambda = new aws.Lambda()


module.exports.handler = async (event) => {
  console.log('event ', event)
  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
    region: 'eu-central-1'
  })


  const params = {
    AccessToken: ((event.headers.authorization).split(' '))[1] /* required */
  }
  const userDetails = await cognitoidentityserviceprovider.getUser(params).promise()

//  try{
  var lambdaParams = {
    FunctionName: 'prod3-poff-api-favourite-get',
    Payload: JSON.stringify({headers : { authorization: ((event.headers.authorization).split(' '))[1] }})
  }
  console.log('invokeParams ', lambdaParams)

  const lambdaResponse = await lambda.invoke(lambdaParams).promise()
  console.log('lambdaResponse ', lambdaResponse)

  const shortlist = JSON.parse(lambdaResponse.Payload).map(id => {
    return {cassette_id: id}
  })
  console.log('shortlist ', shortlist)

// }
// catch(err){null}

  console.log('prindin userDetails')
  console.log(userDetails)
  const userProfile = {
    username: userDetails.Username,
    shortlist: shortlist
  }

  for (const item of userDetails.UserAttributes) {
    userProfile[item.Name] = item.Value
  }

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
