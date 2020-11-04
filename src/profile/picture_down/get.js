'use strict'
const _h = require('../../_helpers')
const aws = require('aws-sdk')

const getSignedUrl = async (operation, params) => {
  const s3Endpoint = 'prod-poff-profile-pictures.s3-eu-central-1.amazonaws.com'
  const s3Bucket = 'prod-poff-profile-pictures'
  if (!params.Bucket) {
    params.Bucket = s3Bucket
  }
  if (!params.Expires) {
    params.Expires = 60
  }
  return new Promise((resolve, reject) => {
    let conf
    if (s3Endpoint) {
      conf = {
        endpoint: s3Endpoint,
        s3BucketEndpoint: true
      }
    }
    aws.config = new aws.Config()
    aws.config.update({
      endpoint: s3Endpoint,
      signatureVersion: 'v4',
      region: 'eu-central-1'
    });
    const s3 = new aws.S3(conf)
    s3.getSignedUrl(operation, params, (err, url) => {
      if (err) {
        return reject(err)
      }
      resolve(url)
    })
  })
}


exports.handler = async (event) => {

  console.log(event)

  let userId = _h.getUserId(event)

  let url = await getSignedUrl('getObject', {Key: userId})

  return { url: url }

}
