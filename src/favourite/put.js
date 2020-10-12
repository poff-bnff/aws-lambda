'use strict'
const AWS = require('aws-sdk')
const jwt = require('jsonwebtoken')

exports.handler = async (event) => {
  console.log(event)

  const accessToken = jwt.decode(((event.headers.authorization).split(' '))[1]) /* required */
  console.log(accessToken)

  var dynamodb = new AWS.DynamoDB()

  var params = {
    Item: {
      cognitoId: {
        S: accessToken.sub
      },
      favouriteFilm: {
        N: pathParameters.movieId
      }
    },
    TableName: 'favourites2'
  }

  const response = await dynamodb.putItem(params).promise()

  console.log(response)
  return response
}
