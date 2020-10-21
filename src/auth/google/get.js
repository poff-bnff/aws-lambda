'use strict'

const _h = require('../../_helpers')

exports.handler = async (event) => {
  const domain = await _h.ssmParameter('prod-poff-cognito-domain')
  const clientId = await _h.ssmParameter('prod-poff-cognito-id')
  const referer = _h.getHeader(event, 'referer')

  return _h.redirect(`${domain}/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${referer}login/&identity_provider=Google`)
}
