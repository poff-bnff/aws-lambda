'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  const body = _h.getBody(event)
  const clientId = await _h.ssmParameter('prod-poff-cognito-client2-id')
  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')

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
