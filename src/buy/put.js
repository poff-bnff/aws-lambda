// 'use strict'

// const _get = require('lodash/get')
// const aws = require('aws-sdk')
// const https = require('https')
// const _h = require('../_helpers')

// const postToMaksekeskus = async (postData) => {
//   const mkId = await _h.ssmParameter('prod-poff-maksekeskus-id')
//   const mkKey = await _h.ssmParameter('prod-poff-maksekeskus-secret-key')
//   const mkHost = await _h.ssmParameter('prod-poff-maksekeskus-host')

//   return new Promise((resolve, reject) => {
//     const options = {
//       hostname: mkHost,
//       path: '/v1/transactions',
//       method: 'POST',
//       headers: {
//         Authorization: 'Basic ' + Buffer.from(`${mkId}:${mkKey}`).toString('base64'),
//         'Content-Type': 'application/json'
//       }
//     }

//     const request = https.request(options, response => {
//       var body = ''

//       response.on('data', function (d) {
//         body += d
//       })

//       response.on('end', function () {
//         resolve(JSON.parse(body))
//       })
//     })

//     request.on('error', reject)
//     request.write(JSON.stringify(postData))
//     request.end()
//   })
// }

// exports.handler = async (event) => {
//   console.log('event ', event);
//   const userId = _h.getUserId(event)
//   const userEmail = await _h.getUserEmail(event)
//   const userIp = _get(event, 'requestContext.http.sourceIp')

//   const categoryId = event.pathParameters.categoryId
//   const body = _h.getBody(event)

//   const return_url = event.queryStringParameters.return_url || event.headers.referer
//   console.log('return_url ', return_url)
//   const cancel_url = event.queryStringParameters.cancel_url || event.headers.referer
//   console.log('cancel_url ', cancel_url)





//   if (!userId) {
//     return _h.error([401, 'Unauthorized'])
//   }

//   if (!categoryId) {
//     return _h.error([400, 'No categoryId'])
//   }

//   if (!body.paymentMethodId) {
//     return _h.error([400, 'No paymentMethodId'])
//   }

//   const docClient = new aws.DynamoDB.DocumentClient()

//   const items = await docClient.query({
//     TableName: 'prod-poff-product',
//     KeyConditionExpression: 'categoryId = :categoryId',
//     ExpressionAttributeValues: {
//       ':categoryId': categoryId
//     },
//     FilterExpression: 'attribute_not_exists(reservedTime)'
//   }).promise()

//   if (items.Items.length === 0) {
//     return _h.error([404, 'No items'])
//   }

//   const item = items.Items[0]
//   console.log('item ', item)
//   console.log('item.price ', item.price)

//   const update_options = {
//     TableName: 'prod-poff-product',
//     Key: {
//       categoryId: item.categoryId,
//       code: item.code
//     },
//     UpdateExpression: 'SET paymentMethodId = :paymentMethodId, reservedTime = :reservedTime, reservedTo = :reservedTo',
//     ExpressionAttributeValues: {
//       ':paymentMethodId': body.paymentMethodId,
//       ':reservedTime': (new Date()).toISOString(),
//       ':reservedTo': userId
//     },
//     ReturnValues: 'UPDATED_NEW'
//   }
//   const updatedItem = await docClient.update(update_options).promise()

//   if (!updatedItem) {
//     return _h.error([500, 'Failed to save reservation'])
//   }

//   const mkResponse = await postToMaksekeskus({
//     customer: {
//       email: userEmail,
//       ip: userIp,
//       country: 'ee',
//       locale: body.locale || 'et'
//     },
//     transaction: {
//       amount: item.price,
//       currency: 'EUR',
//       merchant_data: JSON.stringify({
//         userId: _h.getUserId(event),
//         categoryId: item.categoryId,
//         code: item.code
//       }),
//       transaction_url: {
//         cancel_url: { method: 'POST', url: `https://${_h.getHeader(event, 'host')}/buy?cancel_url=${cancel_url}` },
//         notification_url: { method: 'POST', url: `https://${_h.getHeader(event, 'host')}/buy` },
//         return_url: { method: 'POST', url: `https://${_h.getHeader(event, 'host')}/buy?return_url=${return_url}` }
//       }
//     }
//   })

//   const paymentMethod = [
//     ...mkResponse.payment_methods.banklinks,
//     ...mkResponse.payment_methods.cards,
//     ...mkResponse.payment_methods.other,
//     ...mkResponse.payment_methods.payLater
//   ].find(m => [m.country, m.name].join('_').toUpperCase() === body.paymentMethodId)

//   if (!paymentMethod) {
//     return _h.error([400, 'No paymentMethod'])
//   }



//   return { url: paymentMethod.url }
// }
