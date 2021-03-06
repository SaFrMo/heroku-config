'use strict'

const cli = require('heroku-cli-util')
const co = require('co')
const merge = require('../util/merge')
const file = require('../util/file')

function * push (context, heroku) {
  let fname = context.flags.file // this gets defaulted in read
  let config = yield {
    remote: heroku.get(`/apps/${context.app}/config-vars`),
    local: file.read(fname, context.flags.quiet)
  }
  let res = merge(config.local, config.remote, context.flags)
  try {
    yield heroku.patch(`/apps/${context.app}/config-vars`, { body: res })
    if (!context.flags.quiet) {
      cli.log('Successfully wrote settings to Heroku!')
    }
  } catch (err) {
    cli.exit(1, err)
  }
}

module.exports = {
  topic: 'config',
  command: 'push',
  description: 'push env variables to heroku',
  help: 'Write local config vars into heroku, favoring existing remote configs in case of collision',
  needsApp: true,
  needsAuth: true,
  run: cli.command(co.wrap(push)),
  flags: require('../util/flags')
}
