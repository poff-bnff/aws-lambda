'use strict'

 //- - var myUri = 'https://dev.inscaping.eu/${lang_path}'
 let myUri = `http://localhost:4000/`
 //- - var myUri = `http://localhost:5000/${lang_path}`

 //- - var myUri = `${process.env['DOMAIN']}/${lang_path}`


exports.handler = async () => {
  return {fbLoginUrl: `https://poffuserlogin.auth.eu-central-1.amazoncognito.com/oauth2/authorize?response_type=token&client_id=55092v28eip9fdakv3hv3j548u&redirect_uri=${myUri}login/&identity_provider=Facebook`}
}
