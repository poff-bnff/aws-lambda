'use strict'
var AWS = require('aws-sdk')

module.exports.handler = async (event) => {
  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'eu-central-1' })
  var params = {
    AccessToken: ((event.headers.authorization).split(' '))[1] /* required */
  }
  const userDetails = await cognitoidentityserviceprovider.getUser(params).promise()
  const userProfile = {
    username: userDetails.Username,
    name: userDetails.UserAttributes[3].Value,
    lastname: userDetails.UserAttributes[4].Value,
    email: userDetails.UserAttributes[5].Value

  }

  return userProfile
}
