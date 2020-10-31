'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  console.log(event)
  const userId = _h.getUserId(event)

  if (!userId) {
    return _h.error([401, 'Unauthorized'])
  }

  const docClient = new aws.DynamoDB.DocumentClient()

  // var params = {
  //   TableName: 'prod-poff-product',
  //   Key: {reservedTo: userId}
  // }

  // console.log(params)

  // const favourites = await docClient.get(params).promise()

  const favourites = await docClient.query({
    TableName: 'prod-poff-product',
    KeyConditionExpression: 'categoryId = :rsvdTo',
    ExpressionAttributeValues: {
      ':rsvdTo': 'h08'
    }
  }).promise()

  console.log(favourites)

  return favourites.Items.map(i => [i.movieId]).flat()
}
