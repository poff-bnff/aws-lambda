var aws = require('aws-sdk')

exports.handler = async (event) => {
  console.log(event)
  const sourceUserUserName = event.userName.split('_')
  const sourceUserProviderName = (sourceUserUserName[0][0].toUpperCase()) + sourceUserUserName[0].slice(1)
  var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

  var start = 'email = \"'
  var newUserEmail = event.request.userAttributes.email
  var end = '\"'
  var filter1 = start.concat(newUserEmail, end)
  // console.log(filter1)

  var params = {
    UserPoolId: 'eu-central-1_JNcWEm7pr', /* required */
    AttributesToGet: [
      'email'
      /* more items */
    ],
    Filter: filter1
  }

  const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
  console.log(usersList)

  if (usersList.Users.length !== 0) {
    console.log('merge user')
    console.log(usersList.Users[0].Username)
    const destinationUserUserName = usersList.Users[0].Username.split('_')
    const destinationUserProviderName = (destinationUserUserName[0][0].toUpperCase()) + destinationUserUserName[0].slice(1)

    var params2 = {
      DestinationUser: { /* required */
        ProviderAttributeValue: destinationUserUserName[1],
        ProviderName: destinationUserProviderName
      },
      SourceUser: { /* required */
        ProviderAttributeName: 'Cognito_Subject',
        ProviderAttributeValue: sourceUserUserName[1],
        ProviderName: sourceUserProviderName
      },
      UserPoolId: 'eu-central-1_JNcWEm7pr' /* required */
    }

    const response = await cognitoidentityserviceprovider.adminLinkProviderForUser(params2).promise()
    console.log(response)
    return event
  } else {
    event.response.autoConfirmUser = true
    return event
  }
}
