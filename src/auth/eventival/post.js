'use strict'
const axios = require('axios');
const qs = require('qs');

exports.handler = async (event) => {
    let code = event.body
    console.log(`kood on: ${code}`)

    let data = await GetToken(code)
    let access_token = data.access_token
    let id_token = data.id_token
    return {"access_token": access_token}
}

function GetToken (code){
  let data = qs.stringify({
   'grant_type': 'authorization_code',
  'code': code,
  'client_id': 'ev-poff',
  'redirect_uri': 'http://localhost:4000/login/'
  });

  let config = {
    method: 'post',
    url: 'https://account.eventival.com/auth/realms/Eventival/protocol/openid-connect/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cookie': '__cfduid=da9559ceae522668cdd14e9fd17ba58281603188224'
    },
    data : data
  };

  axios(config)
  .then(function (response) {
    console.log(JSON.stringify(response.data));
    return response.data
  })
  .catch(function (error) {
    console.log(error);
  });

}
