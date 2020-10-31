'use strict'

const _h = require('../../_helpers')

exports.handler = async (event) => {
  const domain = await _h.ssmParameter('prod-poff-cognito-domain')
  const clientId = await _h.ssmParameter('prod-poff-cognito-id')

  const referer_host = _h.getRefererHost(event)
  console.log(referer_host)

  const redirect_uri = `${domain}/oauth2/authorize?response_type=token&client_id=${clientId}&redirect_uri=${referer_host}/login/&identity_provider=Google`
  console.log(redirect_uri)
  return _h.redirect(redirect_uri)
}
