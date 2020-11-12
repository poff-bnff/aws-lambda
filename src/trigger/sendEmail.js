
'use strict'

const _h = require('../_helpers')
var aws = require('aws-sdk')
var lambda = new aws.Lambda()
const https = require('https');



const SendTemplateEmailFromMailChimp = async (mandrillApiKey, templateUsed, email, firstname, lastname, passtype, passcode, passname) => {

  return new Promise((resolve, reject)=>{
    let postData = JSON.stringify({
        key: mandrillApiKey,
        template_name: templateUsed,
        template_content: [],
        message: {
            html: "",
            text: "",
            subject: "",
            from_email: "",
            from_name: "",
            to: [
                {
                    email: "tapferm@gmail.com",
                    type: "to",
                },
            ],
            headers: {},
            important: false,
            track_opens: false,
            track_clicks: false,
            auto_text: false,
            auto_html: false,
            inline_css: false,
            url_strip_qs: false,
            preserve_recipients: false,
            view_content_link: false,
            bcc_address: "",
            tracking_domain: "",
            signing_domain: "",
            return_path_domain: "",
            merge: false,
            merge_language: "mailchimp",
            global_merge_vars: [
                { name: "email", content: email },
                { name: "eesnimi", content: firstname },
                { name: "perenimi", content: lastname },
                { name: "passituup", content: passtype },
                { name: "passikood", content: passcode },
                { name: "passinimi", content: passname },
            ],
            merge_vars: [],
            tags: [],
            subaccount: "test",
            google_analytics_domains: [],
            google_analytics_campaign: "",
            metadata: { website: "" },
            recipient_metadata: [],
            attachments: [],
            images: [],
        },
        async: false,
        ip_pool: "",
        send_at: "",
    });

    const options = {
        hostname: "mandrillapp.com",
        port: 443,
        path: "/api/1.0/messages/send-template",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-MC-MergeVars": [
                '"email": "global value 1"',
                '"eesnimi": "global value 2"',
                '"perenimi": "global value 3"',
                '"passituup": "global value 4"',
                '"passikood": "global value 5"',
                '"passinimi": "global value 6"',
            ],
        },
    };
    const req = https.request(options, (res) => {
        console.log(`E-kirja saatmine aadressile: ${email}`);
        console.log("statusCode:", res.statusCode);
        var body = ''

      res.on("data", (d) => {
          body += d
        })

      res.on('end', (d) =>{
        resolve(JSON.parse(body))
      })
    });

    req.on("error", reject)
    // req.on("error", (e) => {console.log(e);});
    req.write(postData);
    req.end();

  })
}
exports.handler = async (event) => {

  const mandrillApiKey = await _h.ssmParameter('mandrill-api-key')

  console.log('event ', event)

  let userSub = event.userId
  let passType = event.categoryId
  let passCode = event.code

  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
    region: 'eu-central-1'
  })

  const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')
  var start = 'sub = \"'
  var end = '\"'
  var filter1 = start.concat(userSub, end)

  var params = {
    UserPoolId: userPoolId,
    AttributesToGet: [
      'email',
    ],
    Filter: filter1
  }

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log('usersList:', usersList)
  let attributes = usersList.Attributes
  console.log(attributes)

//  const emailRes = await SendTemplateEmailFromMailChimp(mandrillApiKey, "PassiOst", "tapferm@gmail.com", "Mariann",  "Tapfer", passType, passCode, "Just Filmi Pass")
//  console.log(emailRes);

}
