'use strict';
var AWS = require('aws-sdk');
const jwt = require('jsonwebtoken');

let messageContent;

module.exports.handler = (event, context, callback) => {

  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({region: 'eu-central-1'});
  var params = {
    AccessToken: jwt.decode(((event.headers.Authorization).split(' '))[1]) /* required */
  };
  cognitoidentityserviceprovider.getUser(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);
    messageContent = data;          // successful response
  });
// let messageContent = jwt.decode(((event.headers.Authorization).split(' '))[1]);
  // if (messageContent.name && messageContent.family_name && messageContent.email){
  //   console.log('allright, log in');
  //   messageContent.qnrFilled=true;
  // } else {
  //   console.log('Required fields not filled, fill');
  // }
  // console.log(messageContent);

  const response = {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Required for CORS support to work
    },
    body: JSON.stringify({
      message: messageContent
    }),
  };

  callback(null, response);
};
