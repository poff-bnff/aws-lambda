'use strict'

const aws = require('aws-sdk')

exports.handler = async (event) => {
  const build = new aws.CodeBuild()

  if (!event.body) {
    return { error: 404 }
  }

  if (event.headers.authorization !== process.env.API_KEY) {
    return { error: 401 }
  }

  if (process.env.PROJECTS.split(',').includes(event.body)) {
    return { error: 401 }
  }

  const result = await build.startBuild({
    projectName: 'prod-' + event.body
  }).promise()

  return result
}
