'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  const userId = _h.getUserId(event)

  if (!userId) {
    return _h.error([401, 'Unauthorized'])
  }

  if (!event.pathParameters.movieId) {
    return _h.error([400, 'No movieId'])
  }

  const docClient = new aws.DynamoDB.DocumentClient()

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
