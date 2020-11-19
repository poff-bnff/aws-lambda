'use strict'

const _h = require('../_helpers')
var aws = require('aws-sdk')

exports.handler = async (event) => {
    console.log(event)

    const sub = _h.getUserId(event)
    const sub2 = await _h.ssmParameter('prod-poff-pass-raport')

    if (sub.split('-')[0] !== sub2.split('-')[0] && sub.split('-')[4] !== sub2.split('-')[4]) {
        return { status: 'unAuthorized' }
    }

    const docClient = new aws.DynamoDB.DocumentClient()

    let raport = {}
    const categoryIds = ['h08', 'h16', 'h36', 'h00']

    for (const categoryId of categoryIds){

    const items = await docClient.query({
        TableName: 'prod-poff-product',
        KeyConditionExpression: 'categoryId = :categoryId',
        ExpressionAttributeValues: {
            ':categoryId': categoryId
        },
        FilterExpression: 'attribute_exists(transactionTime)'
    }).promise()

    let total = 0
    let dates = {}
    for (const item of items.Items) {
        total += item.price
        
        let date = item.transactionTime.split('T')[0]

        if (dates.hasOwnProperty(date)){
            dates[date] += item.price
        } else {
            dates[date] = item.price
        }
    }
    console.log(dates)
    console.log('total ', total)
    raport[categoryId] = dates
}

    return raport

}
