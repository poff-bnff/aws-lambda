'use strict'

const https = require('https')
const _h = require('../_helpers')

const getMkConfig = async () => {
  const mkId = await _h.ssmParameter('prod-poff-maksekeskus-id')
  const mkKey = await _h.ssmParameter('prod-poff-maksekeskus-secret-key')

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api-test.maksekeskus.ee',
      path: '/v1/shop/configuration',
      method: 'GET',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${mkId}:${mkKey}`).toString('base64'),
        'Content-Type': 'application/json'
      }
    }

    const request = https.request(options, response => {
      var body = ''

      response.on('data', function (d) {
        body += d
      })

      response.on('end', function () {
        resolve(JSON.parse(body))
      })
    })

    request.on('error', reject)
    request.end()
  })
}

exports.handler = async (event) => {
  const userId = _h.getUserId(event)

  if (!userId) {
    return _h.error([401, 'Unauthorized'])
  }

  const mkResponse = await getMkConfig()

  return {
    banklinks: mkResponse.payment_methods.banklinks.map(m => {
      return {
        id: [m.country, m.name].join('_').toUpperCase(),
        name: m.name,
        country: m.country,
        logo: m.logo_url
      }
    }),
    cards: mkResponse.payment_methods.cards.map(m => {
      return {
        id: [m.country, m.name].join('_').toUpperCase(),
        name: m.name,
        country: m.country,
        logo: m.logo_url
      }
    }),
    other: mkResponse.payment_methods.other.map(m => {
      return {
        id: [m.country, m.name].join('_').toUpperCase(),
        name: m.name,
        country: m.country,
        logo: m.logo_url
      }
    }),
    payLater: mkResponse.payment_methods.payLater.map(m => {
      return {
        id: [m.country, m.name].join('_').toUpperCase(),
        name: m.name,
        country: m.country,
        logo: m.logo_url
      }
    }),

  }
}
