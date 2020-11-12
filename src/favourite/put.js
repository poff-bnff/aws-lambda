'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  console.log(event)
  const userId = _h.getUserId(event)
  console.log(userId)

  const docClient = new aws.DynamoDB.DocumentClient()


  if (!userId) {
    return _h.error([401, 'Unauthorized'])
  }

  if (!event.pathParameters.movieId) {
    return _h.error([400, 'No movieId'])
  }

  if (event.body) {
    console.log('body')
    const screening = JSON.parse(event.body)

    const newItem = await docClient.put({
      TableName: 'prod-poff-savedscreenings',
      Item: {
        userId: userId,
        screeningId: screening.id.toString(),
        screeningTitle: screening.screeningTitle,
        screeningTime: screening.screeningTime

      }
    }).promise()

    if (newItem) {
      return { ok: true }
    }

  } else {


    const newItem = await docClient.put({
      TableName: 'prod-poff-favourite',
      Item: {
        userId: userId,
        movieId: event.pathParameters.movieId
      }
    }).promise()

    if (newItem) {
      return { ok: true }
    }
  }
}
