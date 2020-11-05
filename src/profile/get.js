'use strict'
const aws = require('aws-sdk')
const _h = require('../_helpers')


module.exports.handler = async (event) => {
  const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
    region: 'eu-central-1'
  })


  const params = {
    AccessToken: ((event.headers.authorization).split(' '))[1] /* required */
  }
  const userDetails = await cognitoidentityserviceprovider.getUser(params).promise()


  console.log("prindin userDetails")
  console.log(userDetails)
  const userProfile = {
    username: userDetails.Username
  }

  for (const item of userDetails.UserAttributes) {
    userProfile[item.Name] = item.Value
  }


  if (userProfile.phone_number){
    userProfile.phone_number = userProfile.phone_number.replace("+", "")
  }

  // profiil täidetud
  if ('birthdate' in userProfile && 'email' in userProfile && 'address' in userProfile && 'family_name' in userProfile && 'name' in userProfile && 'gender' in userProfile && 'phone_number' in userProfile) {
    userProfile.profile_filled = true
  // registreerinud aga profiil täitmata
  } else if ('email' in userProfile && 'family_name' in userProfile && 'name' in userProfile) {
    userProfile.profile_filled = false
  }

  console.log("frondi versioon profiilist")
  console.log(userProfile)

  return userProfile
}



