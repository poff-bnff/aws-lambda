'use strict'

const aws = require('aws-sdk')
const _h = require('../../_helpers')

exports.handler = async (event) => {
  console.log('event ', event)

  // const userSub = event.userId
  const userSub = JSON.parse(event.body).sub
  

  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
    region: 'eu-central-1'
  })

  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')
  var start = 'sub = \"'
  var end = '\"'
  var filter = start.concat(userSub, end)
  console.log(filter)

  var params = {
    UserPoolId: userPoolId,
    AttributesToGet: ['email', 'name', 'family_name', 'address'],
    Filter: filter,
    Limit: 10
  }

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log('usersList:', usersList)
  const attributes = usersList.Users[0].Attributes
  console.log(attributes)
}
