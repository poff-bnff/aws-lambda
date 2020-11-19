'use strict'

const aws = require('aws-sdk')
const _h = require('../../_helpers')
const lambda = new aws.Lambda()


exports.handler = async (event) => {
  console.log('event ', event)

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
    AttributesToGet: ['email', 'name', 'family_name'],
    Filter: filter,
    Limit: 10
  }

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log('usersList:', usersList)
  if (usersList.Users.length > 0) {
    const user = usersList.Users[0]
    console.log(user)

    const chatUser = {}

    for (const attribute of user.Attributes) {
      console.log(attribute)
      chatUser[attribute.Name] = attribute.Value
    }

    console.log('chatUser', chatUser)

    chatUser.industryUser = await checkIndustryUser(chatUser.email)

    return chatUser
  } else {
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

  console.log('eventivalLambdaParams ', lambdaParams)
  const _response = await lambda.invoke(lambdaParams).promise()
  console.log(_response)
  const payload = JSON.parse(_response.Payload)
  if (payload.response.statusCode === 404){
    return 'invalid email'
  }
  return true
}
