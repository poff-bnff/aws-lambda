'use strict'
const AWS = require('aws-sdk')
var lambda = new AWS.Lambda()

module.exports.handler = async (event) => {
  console.log(event)

  var params = {
    FunctionName: 'prod-poff-api-trigger-cognito-checkIfUserExists',
    Payload: event.body
  }

  const response = await lambda.invoke(params).promise()
  console.log(response)

  if (response.Payload === 'true'){
    console.log('password will be sent')
  }

  return { todo: true }
}
