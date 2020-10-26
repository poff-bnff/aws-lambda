'use strict'

const _get = require('lodash/get')
const aws = require('aws-sdk')
const https = require('https')
const _h = require('../_helpers')

const postToMaksekeskus = async (postData) => {
  console.log(postData)

  return new Promise((resolve, reject) => {
    const mkId = await _h.ssmParameter('prod-poff-maksekeskus-id')
    const mkKey = await _h.ssmParameter('prod-poff-maksekeskus-secret-key')

    const options = {
      hostname: 'api-test.maksekeskus.ee',
      path: '/v1/transactions',
      method: 'POST',
      headers: {
        Authorization: `Basic ${mkId}:${mkKey}`,
        'Content-Type': 'application/json'
      }
    }

    const request = https.request(options, response => {
      var body = ''

      response.on('data', function (d) {
        body += d
      })

      response.on('end', function () {
        resolve(JSON.parse(body))
      })
    })

    request.on('error', reject)
    request.write(JSON.stringify(postData))
    request.end()
  })
}

exports.handler = async (event) => {
  const userId = _h.getUserId(event)
  const categoryId = event.pathParameters.categoryId
  const body = _h.getBody(event)

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

  const mkResponse = await postToMaksekeskus({
    customer: {
      email: _h.getUserEmail(event),
      ip: _get(event, 'requestContext.http.sourceIp'),
      country: 'ee',
      locale: body.locale || 'et'
    },
    transaction: {
      amount: item.price,
      currency : 'EUR',
      merchant_data : {
        userId: _h.getUserId(event),
        categoryId: item.categoryId,
        code: item.code
      }
    }
  })

  if (updatedItem) {
    return mkResponse
  }
}
