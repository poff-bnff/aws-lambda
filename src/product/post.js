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

  const docClient = new aws.DynamoDB.DocumentClient()
  const _id = `${body.categoryId}-${body.code}`

  const newItem = await docClient.put({
    TableName: 'prod-poff-product',
    Item: {
      _id: _id,
      code: body.code,
      categoryId: body.categoryId,
      categoryName: body.categoryName,
      limit: body.limit,
      used: 0,
      createdAt: (new Date()).toISOString()
    }
  }).promise()

  if (newItem) {
    return { _id: _id }
  }
}
