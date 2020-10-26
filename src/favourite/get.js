'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  const userId = _h.getUserId(event)

  if (!userId) {
    return _h.error([401, 'Unauthorized'])
  }

  const docClient = new aws.DynamoDB.DocumentClient()

  const favourites = await docClient.query({
    TableName: 'prod-poff-favourite',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  }).promise()

  return favourites.Items.map(i => [i.movieId]).flat()
}
