'use strict'

const _get = require('lodash/get')
const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  console.log(event)
  const body = _h.getBody(event)
  const mkResponse = JSON.parse(body.json)
  console.log(mkResponse);
  const product = JSON.parse(mkResponse.merchant_data)
  console.log(mkResponse)

  console.log(product)


  if (mkResponse.status !== 'COMPLETED') {
    return _h.error([400, 'Transaction canceled'])
  }

  if (!product.userId || !product.categoryId || !product.code) {
    console.error(mkResponse)
    return _h.error([400, 'Invalid merchant_data'])
  }

  const mkId = await _h.ssmParameter('prod-poff-maksekeskus-id')
  if (mkResponse.shop !== mkId) {
    return _h.error([400, 'Invalid shop'])
  }

  if (mkResponse.status === 'COMPLETED') {
    const docClient = new aws.DynamoDB.DocumentClient()

    console.log(product.categoryId);
    const items = await docClient.query({
      TableName: 'prod-poff-product',
      KeyConditionExpression: 'categoryId = :categoryId and code = :code',
      ExpressionAttributeValues: {
        ':categoryId': product.categoryId,
        ':code': product.code
      }
    }).promise()
    console.log(product.categoryId)

    if (items.Items.length === 0) {
      return _h.error([404, 'No items'])
    }

    const item = items.Items[0]

    const updatedItem2 = await docClient.update({
      TableName: 'prod-poff-product',
      Key: {
        categoryId: item.categoryId,
        code: item.code
      },
      UpdateExpression: 'SET transactionId = :transactionId, transactionTime = :transactionTime, transactionAmount = :transactionAmount',
      ExpressionAttributeValues: {
        ':transactionId': mkResponse.transaction,
        ':transactionTime': mkResponse.message_time,
        ':transactionAmount': mkResponse.amount
      },
      ReturnValues: 'UPDATED_NEW'
    }).promise()

    if (!updatedItem2) {
      return _h.error([500, 'Failed to save transaction'])
    }


    const newItem = await docClient.put({
      TableName: 'prod-poff-userpasses',
      Item: {
        cognitoSub: product.userId,
        passCode: product.code,
        category: product.categoryId
      }
    }).promise()


    if (newItem) {
      return _h.redirect('http://localhost:4000/minupoff')
    }

  }




  // console.log(JSON.parse(body.json))
}
