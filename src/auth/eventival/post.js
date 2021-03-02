'use strict'

exports.handler = async (event) => {
  const code = event.body
  console.log(`code: ${code}`)
  return { access_token: 'testtoken' }
}