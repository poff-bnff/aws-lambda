'use strict'

const _h = require('../../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')
  let destinationUserUserName

  console.log(event)
  const sourceUserUserName = event.userName.split('_')
  const sourceUserProviderName = (sourceUserUserName[0][0].toUpperCase()) + sourceUserUserName[0].slice(1)
  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  var start = 'email = \"'
  var newUserEmail = event.request.userAttributes.email
  var end = '\"'
  var filter1 = start.concat(newUserEmail, end)
  // console.log(filter1)

  var params = {
    UserPoolId: userPoolId, /* required */
    AttributesToGet: [
      'email'
      /* more items */
    ],
    Filter: filter1
  }

  let usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log('usersList:')
  console.log(usersList)

  if (usersList.Users.length !== 0) {
    console.log('merge user')

    destinationUserUserName = usersList.Users[0].Username.split('_')

    if (usersList.Users.length > 1){
      usersList = usersList.Users
      usersList.sort(function(a, b){return new Date(a.UserCreateDate) - new Date(b.UserCreateDate)})
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

    var params2 = {
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

    console.log('params2: ', params2)

    const response = await cognitoidentityserviceprovider.adminLinkProviderForUser(params2).promise()
    console.log(response)
    return event
  } else {
    return event
  }
}
