'use strict'
const aws = require('aws-sdk')

module.exports.handler = async (event) => {
  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({ region: 'eu-central-1' })
  const params = {
    AccessToken: ((event.headers.authorization).split(' '))[1] /* required */
  }
  const userDetails = await cognitoidentityserviceprovider.getUser(params).promise()
  console.log(userDetails)
  const userProfile = { username: userDetails.Username }

  for (const item of userDetails.UserAttributes) {
    userProfile[item.Name] = item.Value
  }

  if ((userProfile.name.slice((userProfile.name.lastIndexOf(' ')) + 1).localeCompare(userProfile.family_name)) === 0) {
    userProfile.name = userProfile.name.slice(0, userProfile.name.lastIndexOf(' '))
  }

  if (!('birthdate' in userProfile)) {
    delete userProfile.profile_filled
  } else {
    userProfile.profile_filled = 'true'
  }

  return userProfile
}
