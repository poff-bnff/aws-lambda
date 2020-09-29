'use strict'
var AWS = require('aws-sdk')

module.exports.handler = async (event) => {
  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({ region: 'eu-central-1' })
  var params = {
    AccessToken: ((event.headers.authorization).split(' '))[1] /* required */
  }
  const userProfile = await cognitoidentityserviceprovider.getUser(params).promise()
  return userProfile
}

// let messageContent = jwt.decode(((event.headers.Authorization).split(' '))[1]);
// if (messageContent.name && messageContent.family_name && messageContent.email){
//   console.log('allright, log in');
//   messageContent.qnrFilled=true;
// } else {
//   console.log('Required fields not filled, fill');
// }
// console.log(messageContent);
