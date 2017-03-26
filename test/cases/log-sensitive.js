const simpleEncryptor = require('simple-encryptor');

const encryptor = simpleEncryptor(process.env.LOG_ENCRYPT_KEY);
function logEncrypted(plainText, secretObj) {
  console.log(plainText, `ENCRYPTED(${encryptor.encrypt(secretObj)})`);
}

logEncrypted('Testing', { sensitiveData: 'a', personNumber: '12333-12333' });
