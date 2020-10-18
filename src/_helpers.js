'use strict'
const aws = require('aws-sdk')
const querystring = require('querystring')

const getHeader = (event, headerKey) => {
  const headers = Object.fromEntries(
    Object.entries(event.headers).map(([k, v]) => [k.toLowerCase(), v])
  )

  return headers[headerKey.toLowerCase()] || ''
}
exports.getHeader = getHeader

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

exports.getBody = (event) => {
  let body = event.body

  if (!body) { return {} }

  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString()
  }

  if (getHeader(event, 'content-type') === 'application/x-www-form-urlencoded') {
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
