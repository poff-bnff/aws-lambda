'use strict'

const _get = require('lodash/get')
const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  const body = _h.getBody(event)
  const mkResponse = JSON.parse(body.json)
  const product = JSON.parse(mkResponse.merchant_data)

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

  console.log(JSON.parse(body.json))
}
