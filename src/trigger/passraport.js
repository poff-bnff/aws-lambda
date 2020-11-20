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
    let eurTotal = 0
    let pcsTotal = 0
    const categoryIds = ['h08', 'h16', 'h36', 'h00']

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
