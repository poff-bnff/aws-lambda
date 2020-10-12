'use strict'
const AWS = require('aws-sdk')

exports.handler = async (event) => {
  var dynamodb = new AWS.DynamoDB()

  const response = await dynamodb.query(params).promise()

  console.log(response)




  return { todo: true }
}
