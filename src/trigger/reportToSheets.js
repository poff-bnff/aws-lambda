
'use strict'

var aws = require('aws-sdk')
const _h = require('../_helpers')
const { google } = require('googleapis');
const sheets = google.sheets('v4');



exports.handler = async (event) => {
    console.log(event)

    const userSub = event.userId

    const cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider({
        region: 'eu-central-1'
    })

    const userPoolId = await _h.ssmParameter('prod-poff-cognito-pool-id')
    var start = 'sub = \"'
    var end = '\"'
    var filter = start.concat(userSub, end)
    console.log(filter)

    var params = {
        UserPoolId: userPoolId,
        AttributesToGet: ['email', 'name', 'family_name', 'phone_number'],
        Filter: filter,
        Limit: 10
    }

    const usersList = await cognitoidentityserviceprovider.listUsers(params).promise()
    const attributes = usersList.Users[0].Attributes
    const userDetails = {}
    for (const item of attributes) {
        userDetails[item.Name] = item.Value
    }

    let dataToGS = {
        date : event.timestamp.split('T')[0], 
        passcode: event.code,
        amount: event.amount,
        fullName: `${userDetails.name} ${userDetails.family_name}`,
        email: userDetails.email,
        phone: userDetails.phone_number.split('+')[1],
        transaction: event.transaction,
        timestamp: event.timestamp,
}
    await writeToSheets(dataToGS)

}

async function writeToSheets(dataToGS) {

    const key = JSON.parse(await _h.ssmParameter('prod-poff-GSA-key'))
    const spreadsheetId = await _h.ssmParameter('prod-poff-sheet-passbuyers')

    const jwtClient = new google.auth.JWT(
        key.client_email,
        null,
        key.private_key,
        [
            'https://www.googleapis.com/auth/drive',
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/spreadsheets'
        ],
        null
    );

    await jwtClient.authorize()

    let values = []

        let row = []
        for (const d in dataToGS) {
            row.push(dataToGS[d])
        }
        values.push(row)

    const resource = {
        values,
    };
    const request = {
        spreadsheetId: spreadsheetId,
        range: 'HÕFF!A2',
        valueInputOption: 'raw',
        resource,
        auth: jwtClient
    }

    let response = await sheets.spreadsheets.values.append(request)
}