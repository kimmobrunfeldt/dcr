const _ = require('lodash');
const simpleEncryptor = require('simple-encryptor');

const encryptor = simpleEncryptor(process.env.LOG_ENCRYPT_KEY);
function logEncrypted(plainText, secretObj) {
  console.log(plainText, `ENCRYPTED(${encryptor.encrypt(secretObj)})`);
}

const largeSecret = _.reduce(_.range(10000), (memo, i) => {
  // eslint-disable-next-line
  memo[`userData${i}`] = 'secret-data';
  return memo;
}, {});

logEncrypted('Testing', largeSecret);
