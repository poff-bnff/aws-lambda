'use strict'
const AWS = require('aws-sdk')
const jwt = require('jsonwebtoken')

exports.handler = async (event) => {
  const accessToken = jwt.decode(event.headers.authorization.split(' ')[1]) /* required */
  const sub = accessToken.sub

  var dynamodb = new AWS.DynamoDB()

  var params = {
    ExpressionAttributeValues: {
      ':v1': {
        S: sub
      }
    },
    KeyConditionExpression: 'cognitoId = :v1',
    TableName: 'favourites2'
  }

  const response = await dynamodb.query(params).promise()
  const myFavouriteFilms = {
    films: []
  }

  for (const item of response.Items) {
    console.log(item.favouriteFilm.N)
    myFavouriteFilms.films.push(item.favouriteFilm.N)
  }
  // console.log(response)
  // console.log(response.Items[0])

  return myFavouriteFilms
}
