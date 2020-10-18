'use strict'

const aws = require('aws-sdk')
const _h = require('../_helpers')

exports.handler = async (event) => {
  const apiKeyAuthorized = await _h.apiKeyAuthorized(event)

  if (!apiKeyAuthorized) {
    return { error: 401, message: 'unauthorized' }
  }

  const body = _h.getBody(event)

  if (!body.user) {
    return { error: 400, message: 'no user' }
  }

  if (!body.project) {
    return { error: 400, message: 'no project' }
  }

  const ssmProjects = await _h.ssmParameter('prod-poff-deploy-projects')
  if (!ssmProjects.split(',').includes(body.project)) {
    return { error: 400, message: 'invalid project' }
  }

  const build = new aws.CodeBuild()
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
