'use strict'
const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  const apiKeyAuthorized = await _h.apiKeyAuthorized(event)

  if (!apiKeyAuthorized) {
    return _h.error([401, 'unauthorized'])
  }

  const body = _h.getBody(event)

  if (!body.code) {
    return _h.error([400, 'no code'])
  }

  if (!body.categoryId) {
    return _h.error([400, 'no categoryId'])
  }

  if (!body.categoryName) {
    return _h.error([400, 'no categoryName'])
  }

  if (!body.limit) {
    return _h.error([400, 'no limit'])
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
