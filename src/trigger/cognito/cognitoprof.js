'use strict'

const aws = require('aws-sdk')
const { identity } = require('lodash')
const _h = require('../../_helpers')
const lambda = new aws.Lambda()


exports.handler = async (event) => {
  console.log('event ', event)
  let usersList

  const userSub = event.queryStringParameters.sub
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
    AttributesToGet: ['email', 'name', 'family_name', 'identities'],
    Filter: filter,
    Limit: 10
  }

  try {
    usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
    console.log('usersList:', usersList)
  }
  catch (err) {
    return {
      status: 424,
      message: 'Failed Dependency',
      time: new Date()
    }
  }

  if (usersList.Users.length > 0) {
    const user = usersList.Users[0]
    console.log(user)

    const chatUser = {industryUser: true}

    for (const attribute of user.Attributes) {
      console.log(attribute)
      if (attribute.Name === 'identities') {

        let providerNames = []
        for (const identity of JSON.parse(attribute.Value)) {
          console.log('identity ', identity)
          providerNames.push(identity.providerName)
        }
        if (!providerNames.includes('Eventival')) {
          chatUser.industryUser = false
        }
      } else {
        chatUser[attribute.Name] = attribute.Value
      }
    }

    if (chatUser.industryUser){
    chatUser.industryUser = await checkIndustryUser(chatUser.email)
    }
    console.log('return chatUser', chatUser)


    return chatUser
  } else {
    console.log('return { user: false }')
    return { user: false }
  }
}


async function checkIndustryUser(email) {
  console.log('hello', email)
  const lambdaParams = {
    FunctionName: 'prod3-poff-api-eventival-getBadges',
    Payload: JSON.stringify({
      email: email
    })
  }

  console.log('lambdaParams ', lambdaParams)
  const _response = await lambda.invoke(lambdaParams).promise()
  console.log(_response)
  const payload = JSON.parse(_response.Payload)
  if (payload.response.statusCode === 404) {
    return false
  }
  return true
}
