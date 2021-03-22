'use strict'
var aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  console.log(event)

  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({ region: 'eu-central-1' })

  if (event.body) {
    const userAttributes = JSON.parse(event.body)
    var params = {
      AccessToken: ((event.headers.authorization).split(' '))[1],
      UserAttributes: userAttributes
    }
    const update = await cognitoidentityserviceprovider.updateUserAttributes(params).promise()

    const sub = await _h.getUserIdFromToken(params.AccessToken)
    if (update != null) { await _h.writeToSheets(sub, 'prod-poff-sheet-contact') }
    return { status: 'ok' }

  } else if (event.sub) {
    console.log(event)

    const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')

    const sub = event.sub
    delete event.sub
    let userAttributes = []

    for (let key in event) {
      let value = event[key]
      userAttributes.push({
        Name: key,
        Value: value
      })
    }
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
