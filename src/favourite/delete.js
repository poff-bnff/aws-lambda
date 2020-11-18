'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  console.log(event)
  const userId = _h.getUserId(event)

  const docClient = new aws.DynamoDB.DocumentClient()

  if (!userId) {
    return _h.error([401, 'Unauthorized'])
  }

  if (!event.pathParameters.movieId) {
    return _h.error([400, 'No movieId'])
  }

  if (event.pathParameters.movieId.split('_')[0] === 'screening') {
    console.log('screening')

    const deletedScreening = await docClient.delete({
      TableName: 'prod-poff-savedscreenings',
      Key: {
        userId: userId,
        screeningId: event.pathParameters.movieId.split('_')[1]
      }
    }).promise()

    if (deletedScreening) {
      return { ok: true }
    }
  } else if (event.pathParameters.movieId.split('_')[0] === 'event') {
    const deletedMyCalEvent = await docClient.delete({
      TableName: 'prod-poff-myCalEvents',
      Key: {
        userId: userId,
        eventId: event.pathParameters.movieId.split('_')[1]
      }
    }).promise()

    if (deletedMyCalEvent) {
      return { ok: true }
    }
  } else {
    const deletedItem = await docClient.delete({
      TableName: 'prod-poff-favourite',
      Key: {
        userId: userId,
        movieId: event.pathParameters.movieId
      }
    }).promise()

    if (deletedItem) {
      return { ok: true }
    }
  }
}
