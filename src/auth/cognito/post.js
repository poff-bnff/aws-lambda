'use strict'
const aws = require('aws-sdk')

exports.handler = async (event) => {
  console.log(event)
  console.log(event.body)

  const credentials = JSON.parse(event.body)

  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  var params = {
    AuthFlow: 'ADMIN_NO_SRP_AUTH', /* required */
    ClientId: '38o2sdp2bluc1kik2v4fni1hj2', /* required */
    UserPoolId: 'eu-central-1_JNcWEm7pr', /* required */
    AuthParameters: { USERNAME: credentials.userName, PASSWORD: credentials.password }
  }

  console.log(params)

  const response = await cognitoidentityserviceprovider.adminInitiateAuth(params).promise()
  console.log(response)

  return response
}
