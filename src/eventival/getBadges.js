const https = require("https");
const convert = require ('xml-js')
var op = require('object-path')
const _h = require('../_helpers')



exports.handler = async (event) => {
  console.log(event)
  const EVENTIVAL_TOKEN = await _h.ssmParameter('prod-poff-eventival-web-token')

  let email = JSON.parse(event.email) || 'tapferm@gmail.com'

  function picAndBadges(xml_str) {
    ev_o = op(JSON.parse(convert.xml2json(xml_str, { compact: true })))
    const pic_and_badges = {
      photo: ev_o.get(['person', 'photos', 'photo', '_text'], null),
      badges: ev_o.get('person.badges.badge', [])
        .filter(badge => badge.cancelled._text === '0')
        .map(badge => {
          let cnt = badge.validity_dates.date.length
          return {
            valid: {
              from: badge.validity_dates.date[0]._text,
              to: badge.validity_dates.date[cnt - 1]._text,
            },
            type: badge.badge_type.name._text
          }
        })
    }
    return pic_and_badges
  }


  let dataString = ''

  const response = await new Promise((resolve, reject) => {
      const req = https.get(`https://bo.eventival.com/poff/24th/en/ws/${EVENTIVAL_TOKEN}/people/badges-for-login-email.xml?login_email=${email}`, function(res) {
        res.on('data', chunk => {
          dataString += chunk;
        });
        res.on('end', () => {
          resolve({
              statusCode: 200,
              body: picAndBadges(dataString)
          });
        });
      });

      req.on('error', (e) => {
        reject({
            statusCode: 500,
            body: 'Something went wrong!'
        });
      });
  });

  return response;
}
