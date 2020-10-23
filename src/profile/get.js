'use strict'
const aws = require('aws-sdk')

module.exports.handler = async (event) => {



  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({ region: 'eu-central-1' })
  const params = {
    AccessToken: ((event.headers.authorization).split(' '))[1] /* required */
  }
  const userDetails = await cognitoidentityserviceprovider.getUser(params).promise()
  console.log(userDetails)
  const userProfile = { username: userDetails.Username }

  for (const item of userDetails.UserAttributes) {
    userProfile[item.Name] = item.Value
  }
  if ((userProfile.name.slice((userProfile.name.lastIndexOf(' ')) + 1).localeCompare(userProfile.family_name)) === 0) {
    userProfile.name = userProfile.name.slice(0, userProfile.name.lastIndexOf(' '))
  }
  let dateCreated

  for (let attr of userDetails.UserAttributes){
    if(attr.Name === "identities"){
      let identities = JSON.parse(attr.Value)
      console.log(attr.Value)
      for (let i of identities){
        dateCreated = i.dateCreated
      }
    }
  }
  console.log(new Date(dateCreated))

  let now = new Date()
  console.log(now)
  now = now.getTime()

  //profiil täidetud
  if ('birthdate' in userProfile && 'email' in userProfile && 'address' in userProfile && 'family_name' in userProfile && 'name' in userProfile &&  'gender' in userProfile && 'phone_number' in userProfile  ) {
    userProfile.profile_filled = true
    console.log(userProfile)
//registreerinud aga profiil täitmata
  } else if ('email' in userProfile && 'family_name' in userProfile && 'name' in userProfile){
    userProfile.profile_filled = false
  }
  if(dateCreated - now < 60000){
    userProfile.profile_filled = 'signup'
  }
  return userProfile
}
