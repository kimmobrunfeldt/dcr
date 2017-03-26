#!/usr/bin/env node

const _ = require('lodash');
const replaceStream = require('replacestream');
const cliParser = require('./cli-parser');
const simpleEncryptor = require('simple-encryptor');

const RE_ENCRYPT = /ENCRYPTED\((.+)\)/g;

function replaceEncryptedBlock(encryptor, wholeMatch, encrypted) {
  const decrypted = encryptor.decrypt(encrypted);
  const plainText = _.isPlainObject(decrypted)
    ? JSON.stringify(decrypted)
    : decrypted;

  if (plainText === null) {
    return '(INVALID DECRYPTION KEY)';
  }

  return plainText;
}

function main(opts) {
  const encryptor = simpleEncryptor(opts.key);

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin
    .pipe(replaceStream(
      RE_ENCRYPT,
      replaceEncryptedBlock.bind(this, encryptor),
      { maxMatchLen: 1024 }
    ))
    .pipe(process.stdout);
}


if (require.main === module) {
  let opts;
  try {
    opts = cliParser.getOpts();
  } catch (err) {
    if (err.argumentError) {
      console.error(err.message);
      process.exit(1);
    }

    throw err;
  }

  main(opts);
}

module.exports = main;
