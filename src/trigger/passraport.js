'use strict'

const _h = require('../_helpers')
var aws = require('aws-sdk')
const { identity } = require('lodash')

const { google } = require('googleapis');
const sheets = google.sheets('v4');

exports.handler = async (event) => {

    const sub = _h.getUserId(event)
    const sub2 = await _h.ssmParameter('prod-poff-pass-raport')

    if (sub.split('-')[0] !== sub2.split('-')[0] && sub.split('-')[4] !== sub2.split('-')[4]) {
        return { status: 'unAuthorized' }
    }

    if (event.rawQueryString === 'passraport') {
        return await passraport()
    }
    if (event.rawQueryString === 'usersraport') {
        return await usersraport()
    }
    if (event.rawQueryString === 'attr') {
        return await attr()
    }

    return
}


async function passraport() {
    const docClient = new aws.DynamoDB.DocumentClient()

    let raport = {}
    let eurTotal = 0
    let pcsTotal = 0
    const categoryIds = ['h08', 'h16', 'h36', 'h00', 'jp1']

    for (const categoryId of categoryIds) {


        const items = await docClient.query({
            TableName: 'prod-poff-product',
            KeyConditionExpression: 'categoryId = :categoryId',
            ExpressionAttributeValues: {
                ':categoryId': categoryId
            },
            FilterExpression: 'attribute_exists(transactionTime)'
        }).promise()

        let eur = 0
        let pcs = 0
        let dates = {}

        for (const item of items.Items) {

            if (item.categoryName !== 'test') {



                eur += item.price
                pcs += 1

                let date = item.transactionTime.split('T')[0]

                if (dates.hasOwnProperty(date)) {
                    dates[date].eur += item.price
                    dates[date].pcs += 1
                } else {
                    dates[date] = { eur: item.price, pcs: 1 }
                }
            }
        }
        dates.eur = eur
        dates.pcs = pcs
        eurTotal += eur
        pcsTotal += pcs

        raport[categoryId] = dates
    }

    raport.eurTotal = eurTotal
    raport.pcsTotal = pcsTotal

    return raport
}

async function usersraport() {
    var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()

    let total = 0
    let unicUsers = 0
    let pswdUsers = 0
    let pswdAndUsers = 0
    let fbUsers = 0
    let gUsers = 0
    let eUsers = 0
    let calendar = await createCalendar()

    var params = {
        UserPoolId: await _h.ssmParameter('prod-poff-cognito-pool-id'),
        AttributesToGet: null
        // Filter: 'STRING_VALUE',
    }

    for (let i = 0; i < 85; i++) {
        const result = await cognitoidentityserviceprovider.listUsers(params).promise()
        total += result.Users.length

        for (const user of result.Users) {
            if (!user.Username.includes('google') && !user.Username.includes('facebook') && !user.Username.includes('eventival')) {
                unicUsers += 1
                // if (user.UserStatus === 'UNCONFIRMED'){
                //     break
                // }

                let createDate = user.UserCreateDate.toDateString()

                for (let date in calendar) {
                    if (date.includes(createDate)) {
                        calendar[date].unicUsers += 1
                        calendar[date].unicSubs.push(user.Username)
                    }
                }

                let userAttributes = []
                for (const attribute of user.Attributes) {
                    userAttributes.push(attribute.Name)
                    if (attribute.Name === 'identities') {
                        pswdAndUsers += 1
                        const identities = JSON.parse(attribute.Value)

                        let connectedIdentities = {}
                        for (const ident of identities) {
                            const dateCreated = ident.dateCreated
                            if (ident.providerName === 'Facebook') {
                                fbUsers += 1
                                connectedIdentities[dateCreated] = ident.providerName
                            }
                            if (ident.providerName === 'Google') {
                                gUsers += 1
                                connectedIdentities[dateCreated] = ident.providerName

                            }
                            if (ident.providerName === 'Eventival') {
                                eUsers += 1
                                connectedIdentities[dateCreated] = ident.providerName
                            }
                        }
                        let createDates = []
                        for (let dateCreated in connectedIdentities) {
                            createDates.push(dateCreated)
                        }
                        createDates.sort(function (a, b) { return a - b })

                        createDate = user.UserCreateDate.getTime()
                        const dateCreated = parseInt(createDates[0])

                        const firstProvider = connectedIdentities[dateCreated]

                        if (dateCreated - createDate < 1000) {
                            for (let date in calendar) {
                                if (date.includes((new Date(dateCreated)).toDateString())) {
                                    calendar[date][firstProvider] += 1
                                    calendar[date].unicSubsSep.push(user.Username)
                                }
                            }
                        }
                    }
                }
                if (!userAttributes.includes('identities')) {
                    pswdUsers += 1

                    let createDate = user.UserCreateDate.toDateString()
                    for (let date in calendar) {
                        if (date.includes(createDate)) {
                            calendar[date].pswdUsers += 1
                            calendar[date].unicSubsSep.push(user.Username)

                        }
                    }
                }
            }




        }
        if (result.PaginationToken) {
            params.PaginationToken = result.PaginationToken

        } else {


            for (const date in calendar) {
                let unicUsersOfDate = []
                for (const sub of calendar[date].unicSubsSep) {
                    calendar[date].unicSubs.splice(calendar[date].unicSubs.indexOf(sub), 1)

                }
                delete calendar[date].unicSubsSep
            }


            const raport = {
                unicUsers: unicUsers,
                pswd: pswdUsers,
                pswdAndUsers: pswdAndUsers,
                facebook: fbUsers,
                google: gUsers,
                eventival: eUsers,
                total: total,
                calendar: calendar,
            }

            for (let date in raport.calendar) {
                // console.log(raport.calendar[date].uncountedSubs)
            }

            return raport

        }
    }
}

createCalendar()
function createCalendar() {
    let calendar = {}

    for (let i = 1; i < 31; i++) {
        let day = i
        var d = new Date(2020, 10, day)
        calendar[d] = {
            unicUsers: 0,
            pswdUsers: 0,
            Facebook: 0,
            Google: 0,
            Eventival: 0,
            unicSubs: [],
            unicSubsSep: [],
            uncountedSubs: []
        }
    }
    for (let i = 1; i < 18; i++) {
        let day = i
        var d = new Date(2020, 11, day)
        calendar[d] = {
            unicUsers: 0,
            pswdUsers: 0,
            Facebook: 0,
            Google: 0,
            Eventival: 0,
            unicSubs: [],
            unicSubsSep: [],
            uncountedSubs: []

        }
    }
    return calendar
}


async function attr() {
    var cognitoidentityserviceprovider = new aws.CognitoIdentityServiceProvider()
    var params = {
        UserPoolId: await _h.ssmParameter('prod-poff-cognito-pool-id'),
        AttributesToGet: null,
        PaginationToken: 'firstPage'
    }
    let datatoGS = []

    while (params.PaginationToken) {
        params.PaginationToken === 'firstPage' && delete params.PaginationToken

        // datatoGS.push([i])
        const result = await cognitoidentityserviceprovider.listUsers(params).promise()
        for (const user of result.Users) {
            if (!user.Username.includes('google') && !user.Username.includes('facebook') && !user.Username.includes('eventival')) {
                let userAttributes = ['createDate', 'name', 'email', 'createTimestamp', 'lastmodTimestamp']
                userAttributes[3] = user.UserCreateDate
                userAttributes[0] = (JSON.stringify(userAttributes[3])).substr(1).split('T')[0]
                userAttributes[4] = user.UserLastModifiedDate
                for (const attribute of user.Attributes) {
                    if (attribute.Name === 'name') {
                        userAttributes[1] = attribute.Value
                    }
                    if (attribute.Name === 'family_name') {
                        userAttributes[1] = `${userAttributes[1]} ${attribute.Value}`
                    }
                    if (attribute.Name === 'email') {
                        userAttributes[2] = attribute.Value
                    }
                }
                if (userAttributes[1] === 'name') {
                    userAttributes[1] = '[name not submitted]'
                }
                datatoGS.push(userAttributes)
            }
        }
        if (result.PaginationToken) {
            params.PaginationToken = result.PaginationToken
        } else {
            await writeToSheets(datatoGS)
            return
        }
    }
}

async function writeToSheets(data) {

    const key = JSON.parse(await _h.ssmParameter('prod-poff-GSA-key'))
    const spreadsheetId = await _h.ssmParameter('prod-poff-sheet-contact')

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

    await clearSheet(spreadsheetId, jwtClient)


    const resource = {
        values: data
    };

    const request = {
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A2',
        valueInputOption: 'raw',
        resource,
        auth: jwtClient
    }

    let response = await sheets.spreadsheets.values.update(request)
    return
}

async function clearSheet(spreadsheetId, jwtClient) {
    const request = {
        spreadsheetId: spreadsheetId,
        range: 'Sheet1!A2:E',
        auth: jwtClient
    }

    await sheets.spreadsheets.values.clear(request)
    return
}