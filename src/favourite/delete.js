'use strict'
const AWS = require('aws-sdk')
const jwt = require('jsonwebtoken')

exports.handler = async (event) => {
  const accessToken = jwt.decode(event.headers.authorization.split(' ')[1]) /* required */
  const sub = accessToken.sub

  var dynamodb = new AWS.DynamoDB()

  var params = {
    Key: {
      cognitoId: {
        S: sub
      },
      favouriteFilm: {
        N: event.pathParameters.movieId
      }
    },
    TableName: 'favourites2',
    ReturnValues: 'ALL_OLD'
  }

  const response = await dynamodb.deleteItem(params).promise()

  const deleted = { movieId: response.Attributes.favouriteFilm.N }
  return deleted
}
