const https = require("https");
const convert = require ('xml-js')

const EVENTIVAL_TOKEN = await _h.ssmParameter('eventival_web_token')


function CleanObject(data){
  for (key in data){
      let key1 = key
      let obj = data[key]
      if (Object.keys(obj).length > 0){
          for (key in obj){
              if(key === "_text"){
                  data[key1]= obj[key]
              }else if (key === "_attributes") {
                  let attr = obj[key]
                  delete obj[key]
                  data[key1]={...attr, ...data[key1]}
              }
               else if (typeof(obj[key]) === 'object'){
                  CleanObject(data[key1])
              }
          }
      }else {
          data[key] = ''
      }
  }
  return data
}


function GetProfile (email){
    const url = `https://bo.eventival.com/poff/24th/en/ws/${EVENTIVAL_TOKEN}/people/badges-for-login-email.xml?login_email=${email}`;
    https.get(url, res => {
  res.setEncoding("utf8");
  let body = "";
  res.on("data", data => {
    body += data;
  });
  res.on("end", () => {
    let profile = JSON.parse(convert.xml2json(body, {compact: true, spaces: 4}))
    profile = CleanObject(profile.person)
    console.log(JSON.stringify(profile))
    return profile
  });
});
}

// GetProfile("tapferm@gmail.com")

function CheckIfValid(dates){
  let now = new Date()
  let today = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`
  return(dates.includes(today))
}

console.log(CheckIfValid(badges[0].dates))





