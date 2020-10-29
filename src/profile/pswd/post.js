'use strict'
const AWS = require('aws-sdk')
var lambda = new AWS.Lambda()
var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()

module.exports.handler = async (event) => {
  console.log(event)
  var data = JSON.parse(event.body)
    console.log(data)
  console.log(data.userName)

  var lambdaParams = {
    FunctionName: 'prod-poff-api-trigger-cognito-checkIfUserExists',
    Payload: event.body
  }

  const lambdaResponse = await lambda.invoke(lambdaParams).promise()
  console.log(lambdaResponse)


  if (lambdaResponse.Payload === 'true'){
    console.log('password will be sent')

    var params = {ClientId: 'fknnfqoit9r4et7qb8982hlh7', /* required */
  Username: data.userName /* required */}

    const response = await cognitoidentityserviceprovider.forgotPassword(params).promise()
    console.log(response)
  }

  return { todo: true }
}
