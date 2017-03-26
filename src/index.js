#!/usr/bin/env node

const _ = require('lodash');
const transformStream = require('./tag-transform-stream');
const cliParser = require('./cli-parser');
const simpleEncryptor = require('simple-encryptor');

function replaceEncryptedBlock(encryptor, encrypted) {
  const decrypted = encryptor.decrypt(encrypted);
  const plainText = _.isPlainObject(decrypted)
    ? JSON.stringify(decrypted)
    : decrypted;

  if (plainText === null) {
    return '(INVALID ENCRYPTED DATA OR DECRYPTION KEY)';
  }

  return plainText;
}

function main(opts) {
  const encryptor = simpleEncryptor(opts.key);

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
  process.stdin
    .pipe(transformStream({
      startTag: 'ENCRYPTED(',
      endTag: ')',
      transform: replaceEncryptedBlock.bind(this, encryptor),
      maxCharsBetweenTags: opts.maxChars,
    }))
    .pipe(process.stdout);

  process.stdout.on('error', (err) => {
    if (err.code === 'EPIPE') {
      process.exit(0);
    }

    throw err;
  });
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
