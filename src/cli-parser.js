const _ = require('lodash');
const yargs = require('yargs');

const VERSION = require('../package.json').version;
const defaultOpts = {
  key: process.env.LOG_ENCRYPT_KEY,
};

function getOpts() {
  const userOpts = getUserOpts();
  const opts = _.merge(defaultOpts, userOpts);
  return validateAndTransformOpts(opts);
}

function getUserOpts() {
  const userOpts = yargs
    .usage('Usage: $0 [options]\n\n')
    .example('npm start | $0')
    .option('key', {
      describe: 'Decryption key',
      default: defaultOpts.key,
      type: 'string',
    })
    .help('h')
    .alias('h', 'help')
    .alias('v', 'version')
    .version(VERSION)
    .argv;

  return userOpts;
}

function validateAndTransformOpts(opts) {
  // No-op for now
  return opts;
}

module.exports = {
  defaultOpts,
  getOpts,
};
