'use strict'

const _h = require('../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
  console.log(event)
  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')
  const clientId = await _h.ssmParameter('prod-poff-cognito-client2-id')


  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  if (event.source === 'preSignUpMergeTrigger') {
    console.log('test');

      var params = {
        UserPoolId: userPoolId,
        Username: event.userName,
        MessageAction: 'SUPPRESS'
      }

      console.log(params)
      const response = await cognitoidentityserviceprovider.adminCreateUser(params).promise()

    console.log(response);
    return response
  } else {

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
}
