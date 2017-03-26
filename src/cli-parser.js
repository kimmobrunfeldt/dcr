const _ = require('lodash');
const yargs = require('yargs');
const VERSION = require('../package.json').version;

const defaultOpts = {
  key: process.env.LOG_ENCRYPT_KEY,
  maxChars: 1024 * 1024,
};

function getUserOpts() {
  const userOpts = yargs
    .usage('Usage: $0 [options]\n\n')
    .example('npm start | $0')
    .option('key', {
      describe: 'Decryption key. Default taken from process.env.LOG_ENCRYPT_KEY.',
      default: process.env.LOG_ENCRYPT_KEY,
      type: 'string',
    })
    .option('max-chars', {
      describe: 'Maximum characters allowed inside encrypted block. If the limit' +
       ' is exceeded, block is printed as is and no transformation is applied.',
      default: defaultOpts.maxChars,
      type: 'number',
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
  if (opts.maxChars < 1) {
    const err = new Error('--max-chars has to be over zero');
    err.argumentError = true;
    throw err;
  }

  return opts;
}

function getOpts() {
  const userOpts = getUserOpts();
  const opts = _.merge(defaultOpts, userOpts);
  return validateAndTransformOpts(opts);
}

module.exports = {
  defaultOpts,
  getOpts,
};
