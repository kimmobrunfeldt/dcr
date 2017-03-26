# dcr

> Decrypt sensitive parts of log stream on the fly

[![Build Status](https://travis-ci.org/kimmobrunfeldt/dcr.svg?branch=master)](https://travis-ci.org/kimmobrunfeldt/dcr) *Build status for master*

[![NPM Badge](https://nodei.co/npm/dcr.png?downloads=true)](https://www.npmjs.com/package/dcr)

Decrypts a log stream with some encrypted details

```
2017-03-25T22:40:38.590Z Request body: ENCRYPTED(09fdb69ec06f0357e972251ea1188f2a92c5929f5206)
```

to readable on the fly:

```
2017-03-25T22:40:38.590Z Request body: {"name": "John Doe"}
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

**To print logs as plain text**

```
npm start | dcr
```

**Print Heroku logs as plain text**

```bash
heroku logs --force-colors -a my-app -t | dcr --key=$(heroku config:get LOG_ENCRYPT_KEY -a my-app)
```

**Decrypt also stderr**

```bash
npm start 2>&1 | dcr
```

Decryption key is read from `process.env.LOG_ENCRYPT_KEY` by default.

**Unfortunately the only way to use `dcr` currently is via piping.** Open
an issue if you have other use cases.

## Install

```bash
npm install -g dcr
```

Only Node 6 is "officially" supported at the moment.


## License

MIT
