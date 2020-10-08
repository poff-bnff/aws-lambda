'use strict'

const aws = require('aws-sdk')

exports.handler = async (event) => {
  const build = new aws.CodeBuild()
  const ssm = new aws.SSM()

  const ssmKey = await ssm.getParameter({ Name: 'prod-poff-deploy-key', WithDecryption: true }).promise()
  const ssmProjects = await ssm.getParameter({ Name: 'prod-poff-deploy-projects', WithDecryption: true }).promise()

  const ssmKeyValue = ssmKey.Parameter.Value
  const ssmProjectsValue = ssmProjects.Parameter.Value

  if (!event.body) {
    return { error: 404 }
  }

  if (ssmKeyValue !== (event.headers.authorization || event.headers.Authorization)) {
    return { error: 401 }
  }

  if (ssmProjectsValue.split(',').includes(event.body)) {
    return { error: 401 }
  }

  const result = await build.startBuild({
    projectName: event.body
  }).promise()

  return result
}
