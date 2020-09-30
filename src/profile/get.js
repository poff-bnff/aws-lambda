'use strict'
const AWS = require('aws-sdk')

module.exports.handler = async (event) => {
  const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'eu-central-1' })
  const params = {
    AccessToken: ((event.headers.authorization).split(' '))[1] /* required */
  }
  const userDetails = await cognitoidentityserviceprovider.getUser(params).promise()
  console.log(userDetails)
  const userProfile = { username: userDetails.Username }

  for (const item of userDetails.UserAttributes) {
    console.log(item)
    userProfile[item.Name] = item.Value
  }

  if (!('birthdate' in userProfile)) {
    userProfile['profile_filled'] = 'false'
  } else {
    userProfile['profile_filled'] = 'true'
  }




  return userProfile
}
