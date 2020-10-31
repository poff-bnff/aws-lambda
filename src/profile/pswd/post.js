'use strict'
const AWS = require('aws-sdk')
const _h = require('../../_helpers')
var lambda = new AWS.Lambda()
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()

module.exports.handler = async (event) => {
  const clientId = await _h.ssmParameter('prod-poff-cognito-client2-id')
  console.log(event)
  var data = JSON.parse(event.body)
  console.log(data)

  if (data.userName) {
    console.log(data.userName)

    var lambdaParams = {
      FunctionName: 'prod-poff-api-trigger-cognito-checkIfUserExists',
      Payload: event.body
    }

    const lambdaResponse = await lambda.invoke(lambdaParams).promise()
    console.log(lambdaResponse)

    if (lambdaResponse.Payload === 'true') {
      console.log('password will be sent')

      var params = {
        ClientId: clientId, /* required */
        Username: data.userName /* required */
      }

      var response = await cognitoidentityserviceprovider.forgotPassword(params).promise()
      console.log(response)
    }

    return { todo: true }
  } else if (data.code) {
    console.log(data.code)

    var params2 = {
      ClientId: clientId, /* required */
      ConfirmationCode: data.code, /* required */
      Password: 'S2ks2m22', /* required */
      Username: 'bd902163-b836-4218-840c-1bd3d5e6bbd0' /* required */
    }

    var response2 = await cognitoidentityserviceprovider.confirmForgotPassword(params2).promise()
    console.log(response2)
  }
}
