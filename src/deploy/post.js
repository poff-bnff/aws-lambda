'use strict'

const aws = require('aws-sdk')

exports.handler = async (event) => {
  const build = new aws.CodeBuild()
  const ssm = new aws.SSM()

  const ssmKey = await ssm.getParameter({ Name: 'prod-poff-deploy-key', WithDecryption: true }).promise()
  const ssmProjects = await ssm.getParameter({ Name: 'prod-poff-deploy-projects', WithDecryption: true }).promise()

  const ssmKeyValue = ssmKey.Parameter.Value
  const ssmProjectsValue = ssmProjects.Parameter.Value

  if (`Bearer ${ssmKeyValue}` !== (event.headers.authorization || event.headers.Authorization)) {
    return { error: 401, message: 'unauthorized' }
  }

  let body = event.body

  if (!body) {
    return { error: 400, message: 'no data' }
  }

  if (event.isBase64Encoded) {
    body = Buffer.from(body, 'base64').toString()
  }
  body = JSON.parse(body)

  if (!body.user) {
    return { error: 400, message: 'no user' }
  }

  if (!body.project) {
    return { error: 400, message: 'no project' }
  }

  if (!ssmProjectsValue.split(',').includes(body.project)) {
    return { error: 400, message: 'invalid project' }
  }

  const result = await build.startBuild({
    projectName: body.project,
    environmentVariablesOverride: [{
      name: 'SLACK_USER',
      value: body.user
    }]
  }).promise()

  return {
    id: result.build.id,
    buildNumber: result.build.buildNumber,
    startTime: result.build.startTime
  }
}
