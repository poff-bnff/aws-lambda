'use strict'
const aws = require('aws-sdk')
const _h = require('../_helpers')

const s3 = new aws.S3()

exports.handler = async (event) => {
  console.log(event)
  let userId = _h.getUserId(event)

  userId = userId

  var params = { Bucket: 'prod-poff-profile-pictures', Key: userId, ContentType: 'image/png' }
  console.log(params)
  var url = s3.getSignedUrl('putObject', params)

  const response = { link: url }

  console.log('response: ' + url)

  return response
}
