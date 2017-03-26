// Test basic usage of cli

const _ = require('lodash');
const path = require('path');
const assert = require('assert');
const VERSION = require('../package.json').version;
const { execShell } = require('./utils');

// Run tests relative to project root
const testDir = path.resolve(__dirname);
process.chdir(path.join(testDir, '..'));

describe('dcr', () => {
  it('help should be successful', () =>
    execShell('node . --help')
      .then((stdout) => {
        assert.notStrictEqual(stdout.indexOf('Usage:'), -1);
        assert.notStrictEqual(stdout.indexOf('Options:'), -1);
        assert.notStrictEqual(stdout.indexOf('Examples:'), -1);
      })
  );

  it('version should be successful', () =>
    execShell('node . --version')
      .then((stdout) => {
        assert.notStrictEqual(stdout.indexOf(VERSION), -1);
      })
  );

  it('log-sensitive.js case', () =>
    execShell('node test/cases/log-sensitive.js | node .')
      .then((stdout) => {
        assert.strictEqual(stdout, 'Testing {"sensitiveData":"a","personNumber":"12333-12333"}\n');
      })
  );

  it('log-sensitive-large-data.js case', () =>
    execShell('node test/cases/log-sensitive-large-data.js | node .')
      .then((stdout) => {
        const largeSecret = _.reduce(_.range(10000), (memo, i) => {
          // eslint-disable-next-line
          memo[`userData${i}`] = 'secret-data';
          return memo;
        }, {});

        assert.strictEqual(stdout, `Testing ${JSON.stringify(largeSecret)}\n`);
      })
  );
});
