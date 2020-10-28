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

    if (i.Name === 'phone_number') {
      console.log('phone_number ' + i.Value)
      if (i.Value[0] !== '+'){
        i.Value = '+' + i.Value
        console.log(i.Value)
      }
    }

  }


  var params = {
    ClientId: 'fknnfqoit9r4et7qb8982hlh7', /* required */
    Password: password, /* required */
    Username: email, /* required */

      UserAttributes: userAttributes

  }

  const response = await cognitoidentityserviceprovider.signUp(params).promise()


  return response

}
