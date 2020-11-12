'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  console.log('event ', event)
  const userId = _h.getUserId(event)
  console.log('userId ', userId)

  const docClient = new aws.DynamoDB.DocumentClient()

  if (!userId) {
    return _h.error([401, 'Unauthorized'])
  }

  if (event.table === 'prod-poff-savedscreenings') {
    console.log('get prod-poff-savedscreenings')

    const savedscreenings = await docClient.query({
      TableName: 'prod-poff-savedscreenings',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    console.log(savedscreenings)

    return savedscreenings
  } else {


    const favourites = await docClient.query({
      TableName: 'prod-poff-favourite',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }).promise()

    return favourites.Items.map(i => [i.movieId]).flat()
  }
}
