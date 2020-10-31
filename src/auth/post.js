'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')
var lambda = new aws.Lambda()


exports.handler = async (event) => {
  const body = _h.getBody(event)
  const clientId = await _h.ssmParameter('prod-poff-cognito-client2-id')
  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')

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
  }



  const cognito = new aws.CognitoIdentityServiceProvider()

  const response = await cognito.adminInitiateAuth({
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    ClientId: clientId,
    UserPoolId: userPoolId,
    AuthParameters: {
      USERNAME: body.userName,
      PASSWORD: body.password
    }
  }).promise()

  return response.AuthenticationResult
}
