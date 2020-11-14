const https = require("https");
// const convert = require ('xml-js')
const _h = require('../../_helpers')



exports.handler = async (event) => {
  console.log(event)
  const EVENTIVAL_TOKEN = await _h.ssmParameter('prod-poff-eventival-web-token')

  // function CleanObject(data){
  //   for (key in data){
  //       let key1 = key
  //       let obj = data[key]
  //       if (Object.keys(obj).length > 0){
  //           for (key in obj){
  //               if(key === "_text"){
  //                   data[key1]= obj[key]
  //               }else if (key === "_attributes") {
  //                   let attr = obj[key]
  //                   delete obj[key]
  //                   data[key1]={...attr, ...data[key1]}
  //               }
  //                else if (typeof(obj[key]) === 'object'){
  //                   CleanObject(data[key1])
  //               }
  //           }
  //       }else {
  //           data[key] = ''
  //       }
  //   }
  //   return data
  // }


  let email = 'tapferm@gmail.com'


  let dataString = '';

  const response = await new Promise((resolve, reject) => {
      const req = https.get(`https://bo.eventival.com/poff/24th/en/ws/${EVENTIVAL_TOKEN}/people/badges-for-login-email.xml?login_email=${email}`, function(res) {
        res.on('data', chunk => {
          dataString += chunk;
        });
        res.on('end', () => {
          console.log(dataString)
          resolve({
              statusCode: 200,
              body: JSON.stringify(JSON.parse(dataString), null, 4)
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


  // function CheckIfValid(dates){
  //   let now = new Date()
  //   let today = `${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()}`
  //   return(dates.includes(today))
  // }

  // console.log(CheckIfValid(badges[0].dates))





