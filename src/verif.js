'use strict'

// const jwt = require('jsonwebtoken')
const jwkToPem = require('jwk-to-pem')

module.exports.handler = (event, context, callback) => {
  const jwk = [
    {
      alg: 'RS256',
      e: 'AQAB',
      kid: 'SIAZu2YBAxboR0p54hBeFtb2htpjEG/0YkVdK7Cqgz0=',
      kty: 'RSA',
      n: '1w-UMApsXYaUORgbZW08pHA3Zi5pOehJFRjZApSeAu3J_a9MJzNuIEFnpm0fi7Dp7HQcopnufSOgcrzEztD77lgNU_5_hPHekfn0P-LWs4kbky9xriW41ZBI7YJrJG5t-3Jax4Y9m1QK6KBAiFj-1xPVc5xHJeRtZMZPu2M6foI_voZYtCx8JX5hfv9z34vd8JQYC6JtcIDgmRQvIOqBKv833me_I2ZusktJEu3bcwjlnAynLRBBRoCtKUjX-8cDoEozPa_pnYYFg67-ttzKrvNm7sFc_0dM2PFPoCxM3hNMBkaxzq0QQvhxdZexm3EWVUUcUOK4PfGKkvqotaNmDw',
      use: 'sig'
    },
    {
      alg: 'RS256',
      e: 'AQAB',
      kid: 'q6Ixf0YFSeW35yfoVlKK1vJCEuWKFnn98LJldMDMMBw=',
      kty: 'RSA',
      n: 'rUlDwoVeGICfBvyWC5mykVHTq3LrbsylBpZPpNcXEScdCY5RYYwPlWx09yfXCZwnm3kdigxdwmiKwCM_qswj5Cbnq_bTnpKvDuNc9fEJDsVyuQAhlxJ7IYTuIVu8uZiuynTSXyvpeDy_BI7x_5ZLLQH9b4osN1oym7-F0riaOltiNLPTmOwS_dQIcmerBdKUlsG6rlV2aMCzotoGcRuWBrCV8hJlrU3Sz6NYjrQlIo0Y84qJzIp2vWBdaQYfjB7mB4uBugTQu4lgzkoqOFwjFIiVqjACThu5iFwBromCw0u6TMEyimbtB3a-r7L6Xw_4_djTudaMALNDmLvbXEp6mQ',
      use: 'sig'
    }
  ]

  const pem = jwkToPem(jwk)
  // let messageContent = jwt.verify(token, pem, { algorithms: ['RS256'] });

  const messageContent = pem

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*' // Required for CORS support to work
    },
    body: JSON.stringify({
      message: messageContent
    })
  }

  callback(null, response)
}
