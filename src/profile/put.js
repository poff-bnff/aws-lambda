'use strict'
var aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  console.log(event)
  
  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({ region: 'eu-central-1' })

  if (event.body) {


    console.log(typeof (event.body))


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

    return { status: 'ok' }
  } else if (event.sub) {
    console.log('sub ', event.sub)

    const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')

    const sub = event.sub
    delete event.sub
    let userAttributes = []

    for (let key in event) {
      console.log(key)
      console.log(event[key])
      let value = event[key]
      userAttributes.push({
        Name: key,
        Value: value
      })
    }

    console.log('userAttr ', userAttributes)

    var params = {
      UserAttributes: userAttributes,
      UserPoolId: userPoolId, /* required */
      Username: sub /* required */
    }
    console.log('params ', params)

    const update = await cognitoidentityserviceprovider.adminUpdateUserAttributes(params).promise()
    console.log(update)
  }
}
