'use strict'

const _h = require('../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
  const clientId = await _h.ssmParameter('prod-poff-cognito-client2-id')

  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  const userAttributes = JSON.parse(event.body)
  let email
  let password

  for (const i of userAttributes) {
    if (i.Name === 'email') {
      console.log('email ' + i.Value)
      email = i.Value
    }

    if (i.Name === 'password') {
      console.log('password ' + i.Value)
      password = i.Value
      userAttributes.pop(i)
    }

  }

  var params = {
    ClientId: clientId, /* required */
    Password: password, /* required */
    Username: email, /* required */

    UserAttributes: userAttributes

  }

  const response = await cognitoidentityserviceprovider.signUp(params).promise()

  return response
}
