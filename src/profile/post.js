var aws = require('aws-sdk')

exports.handler = async (event) => {
  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  console.log(event.body)
  const userAttributes = JSON.parse(event.body)
  console.log(userAttributes)

  let email
  let name
  let familyName
  let password

  for (const i of userAttributes) {
    if (i.Name === 'email') {
      console.log('email' + i.Value)
      email = i.Value
    }
    if (i.Name === 'name') {
      console.log('name' + i.Value)
      name = i.Value
    }
    if (i.Name === 'family_name') {
      console.log('name' + i.Value)
      familyName = i.Value
    }
    if (i.Name === 'password') {
      console.log('password' + i.Value)
      password = i.Value
    }
  }

  var params = {
    ClientId: '38o2sdp2bluc1kik2v4fni1hj2', /* required */
    Password: password, /* required */
    Username: email, /* required */
    // AnalyticsMetadata: {
    //   AnalyticsEndpointId: 'STRING_VALUE'
    // },
    // ClientMetadata: {
    //   '<StringType>': 'STRING_VALUE',
    //   /* '<StringType>': ... */
    // },
    // SecretHash: 'STRING_VALUE',
    UserAttributes: [{ Name: 'name', Value: name }, { Name: 'family_name', Value: familyName }]
  // UserContextData: {
  //   EncodedData: 'STRING_VALUE'
  // },
  // ValidationData: [
  //   {
  //     Name: 'STRING_VALUE', /* required */
  //     Value: 'STRING_VALUE'
  //   },
  //   /* more items */
  // ]
  }

  const response = await cognitoidentityserviceprovider.signUp(params).promise()

  console.log(response)

  // await cognitoidentityserviceprovider.signUp(params, function(err, data) {
  //   console.log('sees');
  //   if (err) console.log(err, err.stack); // an error occurred
  //   else     console.log(data);           // successful response
  // });

  return response

  // event.response.autoConfirmUser = true
  // callback(null, event)
}
