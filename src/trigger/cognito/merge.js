'use strict'

const _h = require('../../_helpers')
var aws = require('aws-sdk')
var lambda = new aws.Lambda()

exports.handler = async (event) => {
  console.log('event ', event)

  if (event.triggerSource === 'PreSignUp_AdminCreateUser' || event.triggerSource === 'PreSignUp_SignUp') {
    return event
  }

  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')
  let destinationUserUserName

  const sourceUserUserName = event.userName.split('_')
  const sourceUserProviderName = (sourceUserUserName[0][0].toUpperCase()) + sourceUserUserName[0].slice(1)

  const searchForUser = {
    loginUsername: event.request.userAttributes.email,
    source: 'preSignUpMergeTrigger'
  }
  var lambdaParams = {
    FunctionName: 'prod3-poff-api-trigger-cognito-checkIfUserExists',
    Payload: JSON.stringify(searchForUser)
  }

  console.log('lambdaParams ', lambdaParams)

  const checkIfUserExistsResponse = await lambda.invoke(lambdaParams).promise()
  console.log('checkIfUserExistsResponse ', checkIfUserExistsResponse)

  if (checkIfUserExistsResponse.Payload === 'false') {
    const postUser = {
      userName: event.request.userAttributes.email,
      source: 'preSignUpMergeTrigger'
    }

    lambdaParams = {
      FunctionName: 'prod3-poff-api-profile-post',
      Payload: JSON.stringify(postUser)
    }

    console.log('lambdaParams ', lambdaParams)

    const postUserResponse = await lambda.invoke(lambdaParams).promise()
    console.log('postUserResponse ', postUserResponse)

    const baseDestinationUser = JSON.parse(postUserResponse.Payload)
    console.log(baseDestinationUser)

    var params2 = {
      DestinationUser: { /* required */
        ProviderAttributeValue: baseDestinationUser.User.Username,
        ProviderName: 'Cognito'
        // ProviderAttributeValue: destinationUserProviderName
        // ProviderName: 'Cognito'
      },
      SourceUser: { /* required */
        ProviderAttributeName: 'Cognito_Subject',
        ProviderAttributeValue: sourceUserUserName[1],
        ProviderName: sourceUserProviderName
      },
      UserPoolId: userPoolId /* required */
    }

    console.log('params2: ', params2)

    const response = await cognitoidentityserviceprovider.adminLinkProviderForUser(params2).promise()
    console.log('response ', response)

    return event
  } else {
    let usersList = JSON.parse(checkIfUserExistsResponse.Payload)
    console.log('usersList ', usersList)
    console.log('merge user')

    destinationUserUserName = usersList.Users[0].Username.split('_')

    if (usersList.Users.length > 1) {
      usersList = usersList.Users
      usersList.sort(function (a, b) { return new Date(a.UserCreateDate) - new Date(b.UserCreateDate) })
      console.log(usersList)

      destinationUserUserName = usersList[0].Username.split('_')
    }

    let destinationUserProviderName

    if (destinationUserUserName[0] === 'facebook' || destinationUserUserName[0] === 'google' || destinationUserUserName[0] === 'eventival') {
      destinationUserProviderName = (destinationUserUserName[0][0].toUpperCase()) + destinationUserUserName[0].slice(1)
      destinationUserUserName = destinationUserUserName[1]
    } else {
      destinationUserProviderName = 'Cognito'
      destinationUserUserName = destinationUserUserName.toString()
    }

    var params3 = {
      DestinationUser: { /* required */
        ProviderAttributeValue: destinationUserUserName,
        ProviderName: destinationUserProviderName
        // ProviderAttributeValue: destinationUserProviderName
        // ProviderName: 'Cognito'
      },
      SourceUser: { /* required */
        ProviderAttributeName: 'Cognito_Subject',
        ProviderAttributeValue: sourceUserUserName[1],
        ProviderName: sourceUserProviderName
      },
      UserPoolId: userPoolId /* required */
    }

    console.log('params2: ', params3)

    const response = await cognitoidentityserviceprovider.adminLinkProviderForUser(params3).promise()
    console.log('response ', response)
    return event
  }
}
