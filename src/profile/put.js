'use strict'
var AWS = require('aws-sdk')

exports.handler = async (event) => {
  console.log(event)
  console.log(typeof (event.body))

  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'eu-central-1' })

  console.log(event.body)
  const userAttributes = JSON.parse(event.body)
  console.log(userAttributes)

  var params = {
    AccessToken: ((event.headers.authorization).split(' '))[1], /* required */
    UserAttributes: userAttributes
    /* more items */

  }

  console.log(params)
  console.log(typeof (params.UserAttributes))

  const update = await cognitoidentityserviceprovider.updateUserAttributes(params).promise()
  console.log(update, 'put')

  // cognitoidentityserviceprovider.updateUserAttributes(params, function (err, data) {
  //   if (err) {
  //     console.log(err, err.stack) // an error occurred
  //     return JSON.stringify(err)
  //   } else {
  //     console.log(data) // successful respons
  //     return JSON.stringify(data)
  //   }
  // })

  // console.log(update)
}
