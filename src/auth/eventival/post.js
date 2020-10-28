'use strict'

exports.handler = async (event) => {
  const code = event.body
  console.log(`kood on: ${code}`)
  return { access_token: 'testtoken' }
}
