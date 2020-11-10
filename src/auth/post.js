'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')
var lambda = new aws.Lambda()


exports.handler = async (event) => {
  console.log('event', event)

  const body = _h.getBody(event)
  const clientId = await _h.ssmParameter('prod-poff-cognito-client2-id')
  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')

  var data = JSON.parse(event.body)
  console.log('data', data)

  if (data.loginUsername) {

    var lambdaParams = {
      FunctionName: 'prod3-poff-api-trigger-cognito-checkIfUserExists',
      Payload: event.body
    }
    console.log('lambdaParams ', lambdaParams)

    const lambdaResponse = await lambda.invoke(lambdaParams).promise()
    console.log('lambdaResponse ', lambdaResponse)

    if (lambdaResponse.Payload === 'false'){
      return {email: data.loginUsername, user: false}
    }

    if (lambdaResponse.Payload){
      let payload = JSON.parse(lambdaResponse.Payload)
      if (payload.userStatus === 'UNCONFIRMED'){
        return {email: payload.email, confirmed: false}
      }
    }


  }

  const cognito = new aws.CognitoIdentityServiceProvider()
  var params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH',
    ClientId: clientId,
    UserPoolId: userPoolId,
    AuthParameters: {
      USERNAME: body.loginUsername,
      PASSWORD: body.password
    }
  }
  console.log('loginParams ', params)

  const response = await cognito.adminInitiateAuth(params).promise()
  console.log('response ', response)
  return response.AuthenticationResult
}
