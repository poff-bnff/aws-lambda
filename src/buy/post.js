'use strict'

const _get = require('lodash/get')
const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  console.log(event)
  const body = _h.getBody(event)
  const mkResponse = JSON.parse(body.json)
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
