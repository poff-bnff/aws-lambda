'use strict'

const aws = require('aws-sdk')
const https = require('https')
const _h = require('../_helpers')

const postToTokenEndpoint = async (postData) => {
  const mkId = await _h.ssmParameter('prod-poff-cognito-id')
  const mkKey = await _h.ssmParameter('prod-poff-cognito-id-secret')

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'pff.auth.eu-central-1.amazoncognito.com',
      path: '/oauth2/token',
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${mkId}:${mkKey}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: 'XSRF-TOKEN=1645d446-e706-4e80-bcec-ebf8dba5e7a3'
      }
    }

    console.log(options)

    const request = https.request(options, response => {
      var body = ''

      response.on('data', function (d) {
        body += d
      })

      response.on('end', function () {
        resolve(JSON.parse(body))
      })
    })

    request.on('error', reject)
    console.log(JSON.stringify(postData))
    request.write(JSON.stringify(postData))
    request.end()
  })
}

exports.handler = async (event) => {
  const mkResponse = await postToTokenEndpoint({
    grant_type: 'authorization_code',
    redirect_uri: 'http://localhost:4000/login/',
    code: 'b7d4f674-6573-486b-85e9-eyteytety'
  })

  console.log(mkResponse)

  return { url: 'url' }
}
