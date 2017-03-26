# dcr

> Decrypt sensitive parts of log stream on the fly

[![NPM Badge](https://nodei.co/npm/dcr.png?downloads=true)](https://www.npmjs.com/package/dcr)

Decrypts a log stream with some encrypted details

```
2017-03-25T22:40:38.590Z - warn: [error-logger.js] Request body: ENCRYPTED(09fdb69ec06f0357e97225178e7403041b32da1520ce5b3eea1188f2a92c5947a29f5206)
```

to readable on the fly:

```
2017-03-25T22:40:38.590Z - warn: [error-logger.js] Request body: {"name": "John Doe"}
```

## Why

This tool makes life easier when handling logs which have encrypted parts.

I use this in my node backend projects. My main use case is to log body objects
of failed requests, which may contain user email, addresses and other personal
data. Sensitive data needs to be encrypted and logging them as plain text
is not a good practice. However I want to keep other parts of the logs as
plain text so they are searchable in e.g. Papertrail.

This prevents accidentally leaking user data via log dumps.

## Usage

In server code, encrypt certain parts of logs with [simple-encryptor](https://github.com/sehrope/node-simple-encryptor). Make sure you print in
`ENCRYPTED(gibberish)` format.

```js
const simpleEncryptor = require('simple-encryptor');

const encryptor = simpleEncryptor(process.env.LOG_ENCRYPT_KEY);
const userData = { name: 'John Doe', securityNumber: '1234' };
console.log('User data', `ENCRYPTED(${encryptor.encrypt(secretObj)})`);
```

To print logs as plain text, just run:

```
npm start | dcr
```

Or with a Heroku app:

```bash
heroku logs -a my-app -t | dcr --key=$(heroku config:get LOG_ENCRYPT_KEY -a my-app)
```

Decryption key is read from `process.env.LOG_ENCRYPT_KEY` by default.

## Install

```bash
npm install -g dcr
```

Only Node 6 is "officially" supported at the moment.


## License

MIT
