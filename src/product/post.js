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

  const oldItem = await docClient.get({
    TableName: 'prod-poff-product',
    Key: {
      categoryId: body.categoryId,
      code: body.code
    }
  }).promise()

  if (oldItem.Item) {
    return _h.error([400, `item exists`])
  }

  const newItem = await docClient.put({
    TableName: 'prod-poff-product',
    Item: {
      code: body.code,
      categoryId: body.categoryId,
      categoryName: body.categoryName,
      limit: body.limit
    }
  }).promise()

  if (newItem) {
    return { ok: true }
  }
}
