'use strict'

// - - var myUri = 'https://dev.inscaping.eu/${lang_path}'
const myUri = 'http://localhost:4000/'
// - - var myUri = `http://localhost:5000/${lang_path}`

// - - var myUri = `${process.env['DOMAIN']}/${lang_path}`

exports.handler = async () => {
  return { providerUrl: `https://account.eventival.com/auth/realms/Eventival/protocol/openid-connect/auth?client_id=ev-poff&redirect_uri=${myUri}login/&scope=openid+email+profile&response_type=code` }
}
