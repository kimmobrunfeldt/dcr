#!/usr/bin/env node

const _ = require('lodash');
const byline = require('byline');
const cliParser = require('./cli-parser');
const simpleEncryptor = require('simple-encryptor');

const RE_ENCRYPT = /ENCRYPTED\((.+)\)/g;

function main(opts) {
  const encryptor = simpleEncryptor(opts.key);

  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  const stdinLineStream = byline(process.stdin, { keepEmptyLines: true });
  stdinLineStream.on('data', (line) => {
    let match = RE_ENCRYPT.exec(line);
    while (match !== null) {
      const encrypted = match[1];
      const decrypted = encryptor.decrypt(encrypted);
      const plainText = _.isPlainObject(decrypted)
        ? JSON.stringify(decrypted)
        : decrypted;

      if (plainText !== null) {
        line = line.replace(match[0], plainText);
      } else {
        line = line.replace(match[0], '(INVALID DECRYPTION KEY)');
      }

      match = RE_ENCRYPT.exec(line);
    }

    process.stdout.write(line);
    process.stdout.write('\n');
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
