'use strict'

const _h = require('../_helpers')
var aws = require('aws-sdk')
var lambda = new aws.Lambda()

exports.handler = async (event) => {
  console.log('event ', event)

  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()
  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')
  const clientId = await _h.ssmParameter('prod-poff-cognito-client2-id')



  if (event.routeKey) {
    let email
    for (let val of JSON.parse(event.body)) {
      if (val.Name === "email") {
        email = val.Value
      }
    }
    if (event.routeKey === "POST /profile") {
      console.log("Heureka", email)

      var lambdaParams = {
        FunctionName: 'prod3-poff-api-trigger-cognito-checkIfUserExists',
        Payload: JSON.stringify({ loginUsername: email, source: event.routeKey })
      }
      console.log('invokeParams ', lambdaParams)
      const lambdaResponse = await lambda.invoke(lambdaParams).promise()

      if (lambdaResponse.Payload !== 'false') {
        console.log('response ', lambdaResponse)
        return lambdaResponse
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
  }



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
  }



}
