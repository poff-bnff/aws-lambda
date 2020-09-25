'use strict';

const jwt = require('jsonwebtoken');

module.exports.handler = (event, context, callback) => {


  let messageContent = jwt.decode(((event.headers.Authorization).split(' '))[1]);
  if (messageContent.name && messageContent.family_name && messageContent.email){
    console.log('allright, log in');
    messageContent.qnrFilled=true;
  } else {
    console.log('Required fields not filled, fill');
  }
  console.log(messageContent);
  
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
