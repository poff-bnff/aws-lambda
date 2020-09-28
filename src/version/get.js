'use strict'

exports.handler = async () => {
  return { branch: process.env.GIT_BRANCH, commit: process.env.GIT_SHA1 }
}
