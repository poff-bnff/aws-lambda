'use strict'
const aws = require('aws-sdk')
const s3 = new aws.S3()

exports.handler = async (event) => {
  console.log(event)

  var params = { Bucket: 'prod-poff-profile-pictures', Key: 'helloo', ContentType: 'image/png' }
  var url = s3.getSignedUrl('putObject', params)

  const response = { link: url }

  console.log('response: ' + url)

  return response
}
