'use strict'

const aws = require('aws-sdk')
const jwt = require('jsonwebtoken')
var jwkToPem = require('jwk-to-pem')
const querystring = require('querystring')
const url = require('url')
const https = require('https')
var lambda = new aws.Lambda()
const { google } = require('googleapis');
const sheets = google.sheets('v4');


const getRefererHost = (event) => {
  const referer_url = url.parse(getHeader(event, 'referer'))
  const referer_protocol = referer_url.protocol
  const referer_host = referer_url.host
  return `${referer_protocol}//${referer_host}`
}
exports.getRefererHost = getRefererHost

const getRefererLang = (event) => {
  const referer_url = url.parse(getHeader(event, 'referer'))
  console.log('referer_url ', referer_url)
  const referer_path = referer_url.pathname
  console.log('referer_path ', referer_path)
  // const referer_host = referer_url.host
  // return `${referer_protocol}//${referer_host}`
}
exports.getRefererLang = getRefererLang

const getHeader = (event, headerKey) => {
  const headers = Object.fromEntries(
    Object.entries(event.headers).map(([k, v]) => [k.toLowerCase(), v])
  )

  return headers[headerKey.toLowerCase()] || ''
}
exports.getHeader = getHeader

const getAuthorization = (event) => {
  return getHeader(event, 'authorization').replace('Bearer ', '')
}
exports.getAuthorization = getAuthorization

const ssmParameters = {}
const ssmParameter = async (name) => {
  if (ssmParameters[name]) { return ssmParameters[name] }

  const ssm = new aws.SSM()
  const ssmValue = await ssm.getParameter({ Name: name, WithDecryption: true }).promise()

  ssmParameters[name] = ssmValue.Parameter.Value

  return ssmValue.Parameter.Value
}
exports.ssmParameter = ssmParameter

exports.apiKeyAuthorized = async (event) => {
  const ssmKeyValue = await ssmParameter('prod-poff-deploy-key')
  return `Bearer ${ssmKeyValue}` === getHeader(event, 'authorization')
}

exports.getUserId = (event) => {
  const token = getAuthorization(event)
  if (!token) { return }
  return jwt.decode(token).sub
}

exports.getUserIdFromToken = (token) => {
  if (!token) { return }
  return jwt.decode(token).sub
}

exports.getUserEmail = async (event) => {
  const cognito = new aws.CognitoIdentityServiceProvider()
  const user = await cognito.getUser({ AccessToken: getAuthorization(event) }).promise()

  return user.UserAttributes.find(d => d.Name === 'email').Value
}

exports.getBody = (event) => {
  let body = event.body

  if (!body) { return {} }

  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString()
  }

  if (getHeader(event, 'content-type') === 'application/x-www-form-urlencoded' || getHeader(event, 'content-type') === 'application/x-www-form-urlencoded; charset=UTF-8') {
    return querystring.parse(body)
  } else {
    return JSON.parse(body)
  }
}

exports.error = (err) => {
  let code
  let message

  if (err.constructor === Array) {
    code = err[0]
    message = err[1]

    console.error(code.toString(), message)
  } else {
    message = err.toString()

    console.error(err)
  }

  return {
    statusCode: code || 500,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: message }),
    isBase64Encoded: false
  }
}

exports.redirect = (url) => {
  return {
    statusCode: 302,
    headers: { Location: url },
    body: null
  }
}

exports.validateToken = async (event) => {
  console.log(event)

  const token = jwt.decode(event, { complete: true })
  console.log('token ', token)
  console.log(Date.now())
  console.log(token.payload.exp)

  if (token.payload.exp * 1000 < Date.now()) {
    console.log('expired token')
    return false
  }
  const keys = JSON.parse(await ssmParameter('prod-poff-cognito-test'))
  console.log(keys)

  for (const key of keys.keys) {
    console.log(key)
    if (key.kid === token.header.kid) {
      const pem = jwkToPem(key)
      console.log('pem ', pem)
      try {
        console.log('verif ', jwt.verify(event, pem, { algorithms: ['RS256'] }))
        jwt.verify(event, pem, { algorithms: ['RS256'] })
        return true
      } catch (err) { console.log(err) }
      console.log('return')
      return false
    }
  }

  return false
}

exports.updateEventivalUser = async (email, sub) => {
  console.log('updateEventivalUserHelpers', sub)

  var lambdaParams = {
    FunctionName: 'prod3-poff-api-eventival-getBadges',
    Payload: JSON.stringify({ email: email })
  }

  console.log('lambdaParams ', lambdaParams)

  const response = await lambda.invoke(lambdaParams).promise()
  console.log('response ', response)

  const payload = JSON.parse(response.Payload)
  if (payload.response.statusCode === 404) {
    return false
  }

  const attributes = {
    name: payload.response.body.name,
    family_name: payload.response.body.lastName,
    sub: sub
  }

  lambdaParams = {
    FunctionName: 'prod3-poff-api-profile-put',
    Payload: JSON.stringify(attributes)
  }

  console.log('lambdaParams ', lambdaParams)

  const response2 = await lambda.invoke(lambdaParams).promise()
  console.log('response ', response2)
}


exports.getUserProfile = async (sub) => {
  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
    region: 'eu-central-1'
  })
  var params = {
    UserPoolId: await this.ssmParameter('prod-poff-cognito-pool-id'),
    Username: sub,
  }

  const user = await cognitoidentityserviceprovider.adminGetUser(params).promise()
  return user
}

exports.writeToSheets = async (sub, sheet) => {

  const key = JSON.parse(await ssmParameter('prod-poff-GSA-key'))
  const spreadsheetId = await ssmParameter(sheet)

  const jwtClient = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/drive.file',
      'https://www.googleapis.com/auth/spreadsheets'
    ],
    null
  );

  const user = await this.getUserProfile(sub)

  let userDetails = ['createDate', 'name', 'email', 'createTimestamp', 'lastmodTimestamp', 'userStatus' ]

  userDetails[3] = user.UserCreateDate
  userDetails[0] = JSON.stringify(user.UserCreateDate).substr(1).split('T')[0]
  userDetails[4] = user.UserLastModifiedDate
  userDetails[5] = user.UserStatus

  for (const attribute of user.UserAttributes) {
    if (attribute.Name === 'name') {
      userDetails[1] = attribute.Value
    }
    if (attribute.Name === 'family_name') {
      userDetails[1] = `${userDetails[1]} ${attribute.Value}`
    }
    if (attribute.Name === 'email') {
      userDetails[2] = attribute.Value
    }
  }

  if (sheet === 'prod-poff-sheet-unccontact') this.toSheetUnccontact(userDetails, spreadsheetId, jwtClient)

  if (user.UserAttributes.length > 2) {

    let resource = {
      values: [[userDetails[2]]]
    };


    let range
    let email

    await jwtClient.authorize()

    do {
      const enterSearchCriteria_request = {
        spreadsheetId: spreadsheetId,
        range: 'backend!A4',
        valueInputOption: 'raw',
        resource,
        auth: jwtClient
      }

      await sheets.spreadsheets.values.update(enterSearchCriteria_request)

      const getRange_request = {
        spreadsheetId: spreadsheetId,
        range: 'backend!A2',
        auth: jwtClient
      }
      range = (await sheets.spreadsheets.values.get(getRange_request)).data.values[0][0]
      email = range.split('_')[1]

      email !== userDetails[2] && console.log(`email mismatch: expected ${userDetails[2]}, got ${email}`)

    } while (email !== userDetails[2])



    const row = range.split('_')[0]

    resource = {
      values: [userDetails]
    };

    await jwtClient.authorize()

    const request = {
      spreadsheetId: spreadsheetId,
      range: `Sheet1!A${row}`,
      valueInputOption: 'raw',
      resource,
      auth: jwtClient
    }

    await sheets.spreadsheets.values.update(request)
    return
  } else {

    if (userDetails[1] === 'name') {
      userDetails[1] = '[name not submitted]'
    }

    const resource = {
      values: [userDetails]
    };

    await jwtClient.authorize()

    const request = {
      spreadsheetId: spreadsheetId,
      range: `Sheet1!A1`,
      valueInputOption: 'raw',
      resource,
      auth: jwtClient
    }

    await sheets.spreadsheets.values.append(request)
    return
  }
}


exports.toSheetUnccontact = async (userDetails, spreadsheetId, jwtClient) => {

  const resource = {
    values: [userDetails]
  };

  await jwtClient.authorize()

  const request = {
    spreadsheetId: spreadsheetId,
    range: `Sheet1!A1`,
    valueInputOption: 'raw',
    resource,
    auth: jwtClient
  }

  await sheets.spreadsheets.values.append(request)
  return
}