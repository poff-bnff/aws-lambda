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

  const passes = await docClient.query({
    TableName: 'prod-poff-userpasses',
    KeyConditionExpression: 'cognitoSub = :reservedTo',
    ExpressionAttributeValues: {
      ':reservedTo': userId
    }
  }).promise()

  console.log(passes)

  console.log(passes.Items[0].passCode);
  console.log(passes.Items[0].category);

let passesWithInfo = []

for (let pass of passes.Items){

  const passWithInfo = await docClient.query({
    TableName: 'prod-poff-product',
    KeyConditionExpression: 'categoryId = :catId and code = :code',
    ExpressionAttributeValues: {
      ':code': pass.passCode,
      ':catId': pass.category

    }
  }).promise()

  passesWithInfo.push(passWithInfo)
}



  console.log(passesWithInfo);

  return passesWithInfo

  // return favourites.Items.map(i => [i.movieId]).flat()
}
