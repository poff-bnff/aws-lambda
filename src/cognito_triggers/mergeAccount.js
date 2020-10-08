var AWS = require('aws-sdk')

exports.handler = async (event) => {
  console.log(event)
  console.log(event.request.userAttributes.email)
  var cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider()

  var start = 'email = \"'
  var newUserEmail = event.request.userAttributes.email
  var end = '\"'
  var filter1 = start.concat(newUserEmail, end)
  console.log(filter1);

  var params = {
    UserPoolId: 'eu-central-1_JNcWEm7pr', /* required */
    AttributesToGet: [
      'email',
      /* more items */
    ],
    Filter: filter1
  };

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log(usersList)
  console.log(typeof usersList)
  console.log(usersList.length)


  if (usersList.length !== 0) {
    console.log('merge user')
  } else{
    event.response.autoConfirmUser = true
  }



  // callback(null, event)



}
