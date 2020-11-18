'use strict'

const _h = require('../../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
  console.log(event)

  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')

  console.log(event.loginUsername)
  var email = event.loginUsername
  var start = 'email = \"'
  var newUserEmail = email
  var end = '\"'
  var filter1 = start.concat(newUserEmail, end)
  console.log(filter1)

  var params = {
    UserPoolId: userPoolId,
    /* required */
    AttributesToGet: [
      'email'
      // 'email_verified'
      /* more items */
    ],
    Filter: filter1
  }

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log('usersList:', usersList)

  if (usersList.Users.length === 0) {
    console.log(0)
    return false
  }
  console.log(usersList.Users[0].Attributes)
  console.log(usersList.Users[0].Attributes[0].Value)

  if (usersList.Users[0].Attributes[0].Value === 'false' && event.source === 'password') {
    console.log(1)
    return false
  }

  if (usersList.Users.length > 0 && event.source === 'preSignUpMergeTrigger') {
    console.log(2)
    return usersList
  }

  if (usersList.Users.length > 0 && event.source === 'POST /profile') {
    console.log(3)

    const response = []

    for (const user of usersList.Users) {
      if (user.UserStatus == 'EXTERNAL_PROVIDER') {
        response.push(user.Username.split('_')[0])
      }
    }
    return response
  }

  if (usersList.Users.length > 0) {
    console.log(4)

    for (const user of usersList.Users) {
      console.log(44)
      if (user.UserStatus === 'UNCONFIRMED') {
        console.log(444)
        const unConfirmedUser = {
          email: event.loginUsername,
          sub: user.Username,
          userStatus: user.UserStatus
        }
        return unConfirmedUser
      }
    }
  }

  if (usersList.Users.length > 0) {
    console.log(5)

    for (const user of usersList.Users) {
      if (user.UserStatus === 'CONFIRMED') {
        const sub = {
          sub: user.Username
        }
        return sub
      }
    }
  } else {
    console.log(6)
    return false
  }
}
