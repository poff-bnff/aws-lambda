var aws = require('aws-sdk')

exports.handler = async (event) => {
  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  const userAttributes = JSON.parse(event.body)
  let email
  let password

  for (const i of userAttributes) {
    if (i.Name === 'email') {
      console.log('email ' + i.Value)
      email = i.Value
    }

    if (i.Name === 'password') {
      console.log('password ' + i.Value)
      password = i.Value
      userAttributes.pop(i)
    }

  }


  var params = {
    ClientId: '38o2sdp2bluc1kik2v4fni1hj2', /* required */
    Password: password, /* required */
    Username: email, /* required */

      UserAttributes: userAttributes

  }

  const response = await cognitoidentityserviceprovider.signUp(params).promise()


  return response

}
