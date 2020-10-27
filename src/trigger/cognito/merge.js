var aws = require('aws-sdk')

// - - var myUri = 'https://dev.inscaping.eu/${lang_path}'
const myUri = 'http://localhost:4000/'
// - - var myUri = `http://localhost:5000/${lang_path}`

// - - var myUri = `${process.env['DOMAIN']}/${lang_path}`

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
  console.log('usersList:')
  console.log(usersList)

  if (usersList.Users.length !== 0) {
    console.log('merge user')

    let destinationUserUserName = usersList.Users[0].Username.split('_')
    console.log(destinationUserUserName)

    let destinationUserProviderName
    let redirectUrl

    if (destinationUserUserName[0] === 'facebook' || destinationUserUserName[0] === 'google'){
    destinationUserProviderName = (destinationUserUserName[0][0].toUpperCase()) + destinationUserUserName[0].slice(1)
    destinationUserUserName = destinationUserUserName[1]

    } else {
      destinationUserProviderName = 'Cognito'
      destinationUserUserName = destinationUserUserName.toString()
    }

    var params2 = {
      DestinationUser: { /* required */
        ProviderAttributeValue: destinationUserUserName,
        ProviderName: destinationUserProviderName
        // ProviderAttributeValue: destinationUserProviderName
        // ProviderName: 'Cognito'
      },
      SourceUser: { /* required */
        ProviderAttributeName: 'Cognito_Subject',
        ProviderAttributeValue: sourceUserUserName[1],
        ProviderName: sourceUserProviderName
      },
      UserPoolId: 'eu-central-1_JNcWEm7pr' /* required */
    }

    console.log('params2: ', params2)

    const response = await cognitoidentityserviceprovider.adminLinkProviderForUser(params2).promise()
    console.log(response)

    if (destinationUserProviderName === 'Facebook'){
      return { providerUrl: `https://poffuserlogin.auth.eu-central-1.amazoncognito.com/oauth2/authorize?response_type=token&client_id=55092v28eip9fdakv3hv3j548u&redirect_uri=${myUri}login/&identity_provider=Facebook` }
    }
    if (destinationUserProviderName === 'Google'){
      return { providerUrl: `https://poffuserlogin.auth.eu-central-1.amazoncognito.com/oauth2/authorize?response_type=token&client_id=55092v28eip9fdakv3hv3j548u&redirect_uri=${myUri}login/&identity_provider=Google` }
    }


  } else {

    return event
  }
}
