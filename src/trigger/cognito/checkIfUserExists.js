'use strict'

const _h = require('../../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')

  console.log(event)
  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  var email = event.userName
  var start = 'email = \"'
  var newUserEmail = email
  var end = '\"'
  var filter1 = start.concat(newUserEmail, end)
  console.log(filter1)

  var params = {
    UserPoolId: userPoolId, /* required */
    AttributesToGet: [
      'email',
      'email_verified'
      /* more items */
    ],
    Filter: filter1
  }

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log('usersList:')
  console.log(usersList)
  console.log(usersList.Users[0].Attributes)
  console.log(usersList.Users[0].Attributes[0].Value)

  if (usersList.Users[0].Attributes[0].Value === 'false'){
    return false
  }

  if (usersList.Users.length > 0) {
    return true
  } else { return false }
}
