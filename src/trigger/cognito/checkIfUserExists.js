'use strict'

const _h = require('../../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
  console.log(event)

  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')


  console.log(event.loginUsername);
  var email = event.loginUsername
  var start = 'email = \"'
  var newUserEmail = email
  var end = '\"'
  var filter1 = start.concat(newUserEmail, end)
  console.log(filter1)

  var params = {
    UserPoolId: userPoolId, /* required */
    AttributesToGet: [
      'email',
      // 'email_verified'
      /* more items */
    ],
    Filter: filter1
  }

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log('usersList:', usersList)

  if (usersList.Users.length === 0) {
    return
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

  if (usersList.Users.length > 0) {
    console.log(3)

    for (let user of usersList.Users){
      if (user.UserStatus === 'CONFIRMED'){
        let sub = {sub: user.Username}
        return sub

      }
    }


  } else {
    console.log(4)
    return false
  }
}
