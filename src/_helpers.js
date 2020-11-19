'use strict'

const aws = require('aws-sdk')
const jwt = require('jsonwebtoken')
const querystring = require('querystring')
const url = require('url')
const https = require('https')
var lambda = new aws.Lambda()


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

  console.log(jwt.decode(token))

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

  const token = jwt.decode(event)
  console.log('token ', token)
  console.log(Date.now())
  console.log(token.exp)

  if (token.exp * 1000 < Date.now()) {
    console.log('expired token')
    return 'expired token'
  }
  const keys = await ssmParameter('prod-poff-cognito-test')
  console.log(keys)
  return 'valid token'
}

exports.updateEventivalUser = async (email, sub) => {
  console.log('updateEventivalUserHelpers', sub)
 
  var lambdaParams = {
    FunctionName: 'prod3-poff-api-eventival-getBadges',
    Payload: JSON.stringify({email: email})
  }

  console.log('lambdaParams ', lambdaParams)

  const response = await lambda.invoke(lambdaParams).promise()
  console.log('response ', response)

  const payload = JSON.parse(response.Payload)
  if (payload.response.statusCode === 404){
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

  return
}
