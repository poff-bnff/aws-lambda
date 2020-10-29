'use strict'

const _h = require('../../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')

  console.log(event)
  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  var filter1 = 'email =' + event.request.userAttributes.email
  console.log(filter1)

  var params = {
    UserPoolId: userPoolId, /* required */
    AttributesToGet: [
      'email'
      /* more items */
    ],
    Filter: filter1
  }

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log('usersList:')
  console.log(usersList)

  return event
}
