'use strict'
const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  const apiKeyAuthorized = await _h.apiKeyAuthorized(event)

  if (!apiKeyAuthorized) {
    return { error: 401, message: 'unauthorized' }
  }

  const body = _h.getBody(event)

  if (!body.code) {
    return { error: 400, message: 'no code' }
  }

  if (!body.categoryId) {
    return { error: 400, message: 'no categoryId' }
  }

  if (!body.categoryName) {
    return { error: 400, message: 'no categoryName' }
  }

  if (!body.limit) {
    return { error: 400, message: 'no limit' }
  }

  const dynamodb = new aws.DynamoDB()

  const response = await dynamodb.putItem({
    TableName: 'products',
    Item: {
      _id: `${body.categoryId}-${body.code}`,
      code: body.code,
      categoryId: body.categoryId,
      categoryName: body.categoryName,
      limit: body.limit,
      used: 0
    }
  }).promise()

  return response
}
