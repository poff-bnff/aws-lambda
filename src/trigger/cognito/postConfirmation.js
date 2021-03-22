'use strict'

const _h = require('../../_helpers')
var aws = require('aws-sdk')
var lambda = new aws.Lambda()

exports.handler = async (event) => {
  console.log('event ', event)
  const sub = event.request.userAttributes.sub

  await _h.writeToSheets(sub, 'prod-poff-sheet-contact', true)
}