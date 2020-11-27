const https = require('https')
const convert = require('xml-js')
var op = require('object-path')
const _h = require('../_helpers')

const EVENTIVALBADGEWHITELIST = [
  'MANAGEMENT',
  'JURY',
  'INDUSTRY ACCESS',
  'INDUSTRY PRO',
  'GUEST',
  'STAFF',
  'VOLUNTEER',
  'TOETAJA HUNDIPASS'
]

const timezonestr = ' 00:00:00 GMT+0200'

function picAndBadges (xml_str, event) {
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


  console.log('pic and badges ', pic_and_badges)
  
  const badges = pic_and_badges.badges
  console.log('badges ', badges)

  if (badges.length === 0){
    console.log('Eventival Error NoAccreditation ', event.email)
  }

  for (let i = 0; i < badges.length; i++){
    console.log('badge ', badges[i])
    console.log((EVENTIVALBADGEWHITELIST.includes(badges[i].type.toUpperCase())))
    console.log('i1 ', i)
    if (EVENTIVALBADGEWHITELIST.includes(badges[i].type.toUpperCase())){
      console.log('about to break')
      break
    }
    console.log('i2 ', i)
    console.log('length ', badges.length)

    if (i === badges.length-1){
      console.log('Eventival Error NoAccreditation ', event.email)
    }
  }

  console.log('pic and badges ', pic_and_badges)
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
            body: picAndBadges(dataString, event)
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
