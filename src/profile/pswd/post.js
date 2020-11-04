'use strict'
const AWS = require('aws-sdk')
const _h = require('../../_helpers')
var lambda = new AWS.Lambda()
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()

module.exports.handler = async (event) => {
  console.log('event ', event)


  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')
  const clientId = await _h.ssmParameter('prod-poff-cognito-client2-id')

  const validateTokenResult = await _h.validateToken()
  console.log('validateresult ', validateTokenResult)

  var data = JSON.parse(event.body)

  var lambdaParams = {
    FunctionName: 'prod-poff-api-trigger-cognito-checkIfUserExists',
    Payload: event.body
  }
  console.log('invokeParams ', lambdaParams)

  const lambdaResponse = await lambda.invoke(lambdaParams).promise()
  console.log('response ', lambdaResponse)

  let sub = JSON.parse(lambdaResponse.Payload)
  console.log(Boolean(!data.code))

  if (!data.code) {
    console.log('password will be sent')

    var params1 = {
      UserAttributes: [{
        Name: 'email_verified',
        Value: 'true'
      }],
      UserPoolId: userPoolId,
      Username: sub.sub
    }

    var response = await cognitoidentityserviceprovider.adminUpdateUserAttributes(params1).promise()
    console.log(response)


    var params = {
      ClientId: clientId, /* required */
      Username: data.loginUsername /* required */
    }

    var response = await cognitoidentityserviceprovider.forgotPassword(params).promise()
    console.log(response)


    return { todo: true }
  }

  if (data.code) {
    console.log(data.code)

    var params2 = {
      ClientId: clientId, /* required */
      ConfirmationCode: data.code, /* required */
      Password: data.newPswd, /* required */
      Username: sub.sub /* required */
    }

    var response2 = await cognitoidentityserviceprovider.confirmForgotPassword(params2).promise()
    console.log(response2)
  }
}
