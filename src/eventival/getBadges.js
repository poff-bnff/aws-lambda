const https = require('https')
const convert = require('xml-js')
var op = require('object-path')
const _h = require('../_helpers')

const timezonestr = ' 00:00:00 GMT+0200'

function picAndBadges (xml_str) {
  const ev_o = op(JSON.parse(convert.xml2json(xml_str, { compact: true })))

  let badgearr = ev_o.get('person.badges.badge', [])

  if (!Array.isArray(badgearr)) {
    badgearr = [badgearr]
  }

  let professionarr = ev_o.get('person.eventival_categorization.professions.profession')

  if (!Array.isArray(professionarr)) {
    professionarr = [professionarr]
  }

  const pic_and_badges = {
    photo: ev_o.get(['person', 'photos', 'photo', '_text'], null),
    name: ev_o.get(['person', 'names', 'name_first', '_text'], null),
    lastName: ev_o.get(['person', 'names', 'name_last', '_text'], null),
    professions: professionarr,
    badges: badgearr
      .filter(badge => badge.cancelled._text === '0')
      .map(badge => {
        const cnt = badge.validity_dates.date.length
        return {
          valid: {
            from: badge.validity_dates.date[0]._text + timezonestr,
            to: badge.validity_dates.date[cnt - 1]._text + timezonestr
          },
          type: badge.badge_type.name._text
        }
      })
  }
  return pic_and_badges
}

exports.handler = async (event) => {
  console.log('event', event)
  const EVENTIVAL_TOKEN = await _h.ssmParameter('prod-poff-eventival-web-token')

  const email = event.email

  let dataString = ''

  const response = await new Promise((resolve, reject) => {
    const req = https.get(`https://bo.eventival.com/poff/24th/en/ws/${EVENTIVAL_TOKEN}/people/badges-for-login-email.xml?login_email=${email}`, function (res) {
      res.on('data', chunk => {
        dataString += chunk
      })
      res.on('end', () => {
        console.log('EventivalDataString ', email, ' ', dataString)
        if (res.statusCode === 200) {
          resolve({
            statusCode: 200,
            body: picAndBadges(dataString)
          })
        }
        resolve({
          statusCode: res.statusCode
        })
      })
    })

    req.on('error', (e) => {
      reject({
        statusCode: 500,
        body: 'Something went wrong!'
      })
    })
  })

  console.log('response', response)
  return { response: response }
}
