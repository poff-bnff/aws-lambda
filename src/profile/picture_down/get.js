'use strict'
const _h = require('../../_helpers')
const aws = require('aws-sdk')

const getSignedUrl = async (userId) => {
  const signedUrlExpireSeconds = 60 * 10
  const myBucket = 'prod-poff-profile-pictures'
  const myKey = userId
  const accessKeyId = await _h.ssmParameter('prod-poff-s3-key')
  const secretAccesskey = await _h.ssmParameter('prod-poff-s3-secret')

  const s3 = new aws.S3({
    accessKeyId: accessKeyId,
    signatureVersion: 'v4',
    region: 'eu-central-1',
    secretAccessKey: secretAccesskey
  })

  const url = s3.getSignedUrl('getObject', {
    Bucket: myBucket,
    Key: myKey,
    Expires: signedUrlExpireSeconds
  })

  console.log(url)

  return url
}

exports.handler = async (event) => {
  console.log(event)

  const userId = _h.getUserId(event)

  const url = await getSignedUrl(userId)

  return { url: url }
}
