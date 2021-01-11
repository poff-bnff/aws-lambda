'use strict'

const _h = require('../_helpers')
var aws = require('aws-sdk')
const { identity } = require('lodash')

exports.handler = async (event) => {
    console.log(event)

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
                            // console.log(typeof dateCreated);
                            // console.log(new Date(dateCreated))
                            for (let date in calendar) {
                                if (date.includes((new Date(dateCreated)).toDateString())) {
                                    calendar[date][firstProvider] += 1
                                    calendar[date].unicSubsSep.push(user.Username)
                                }
                            }
                        }

                        // console.log((1605905158896).toDateString()) 
                        // console.log(dateCreated) 
                        // console.log(dateCreated-createDate)

                        // let x = Math.floor(1605801670764 / 1000)*1000
                        // console.log(x)
                        // x = new Date(x)
                        // x = x.toString().split('.')[0]
                        // console.log(new Date(1605557571123))
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

            // console.log(calendar);

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
                console.log(raport.calendar[date].uncountedSubs)
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



// testfunc()
// function testfunc(){
//     const dateCreated = (new Date(1605514434621)).toDateString()
//     console.log(dateCreated)
// }