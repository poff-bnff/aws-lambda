'use strict'

const _h = require('../../_helpers')

exports.handler = async (event) => {
  console.log('event ', event)

  const domain = await _h.ssmParameter('prod-poff-cognito-domain')
  const clientId = await _h.ssmParameter('prod-poff-cognito-id')
  const referer = _h.getHeader(event, 'referer')

  const redirect_uri = (`${domain}/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${referer}login/&identity_provider=Eventival`)
  console.log('redirect uri ', redirect_uri)
  return _h.redirect(redirect_uri)
}
