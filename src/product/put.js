'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  const userId = _h.getUserId(event)
  const categoryId = event.pathParameters.categoryId

  if (!userId) {
    return _h.error([401, 'Unauthorized'])
  }

  if (!categoryId) {
    return _h.error([400, 'No categoryId'])
  }

  const docClient = new aws.DynamoDB.DocumentClient()

  const items = await docClient.query({
    TableName: 'prod-poff-product',
    KeyConditionExpression: 'categoryId = :categoryId',
    ExpressionAttributeValues: {
      ':categoryId': categoryId
    },
    FilterExpression: 'attribute_not_exists(reservedAt)'
  }).promise()

  if (items.Items.length === 0) {
    return _h.error([404, 'No items'])
  }

  const item = items.Items[0]

  const updatedItem = await docClient.update({
    TableName: 'prod-poff-product',
    Key: {
      categoryId: item.categoryId,
      code: item.code
    },
    UpdateExpression: 'SET reservedAt = :reservedAt, reservedTo = :reservedTo',
    ExpressionAttributeValues: {
      ':reservedAt': (new Date()).toISOString(),
      ':reservedTo': userId
    },
    ReturnValues: 'UPDATED_NEW'
  }).promise()

  if (updatedItem) {
    return { ok: true }
  }
}
