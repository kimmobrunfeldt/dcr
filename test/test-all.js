// Test basic usage of cli

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

  it('limit the amount of chars allowed in encrypted block', () =>
    execShell('node test/cases/10-chars-inside-block.js | node . --max-chars=9')
      .then((stdout) => {
        assert.strictEqual(stdout, 'Testing ENCRYPTED(0123456789)\n');
      })
  );

  it('multiple-start-tags.js case', () =>
    execShell('node test/cases/multiple-start-tags.js | node .')
      .then((stdout) => {
        // A second start tag between tags are ignored. The data is tried
        // to decrypt but it is of course invalid
        assert.strictEqual(stdout, 'Testing (INVALID ENCRYPTED DATA OR DECRYPTION KEY)\n');
      })
  );

  it('empty-data.js case', () =>
    execShell('node test/cases/empty-data.js | node .')
      .then((stdout) => {
        assert.strictEqual(stdout, 'Testing (INVALID ENCRYPTED DATA OR DECRYPTION KEY)\n');
      })
  );

  it('partial-start-tag.js case', () =>
    execShell('node test/cases/partial-start-tag.js | node .')
      .then((stdout) => {
        // Should be just printed as is, no transformations should be applied
        assert.strictEqual(stdout, 'Testing ENCRYP )\n');
      })
  );

  it('no-end-tag.js case', () =>
    execShell('node test/cases/no-end-tag.js | node .')
      .then((stdout) => {
        // Should be just printed as is, no transformations should be applied
        assert.strictEqual(stdout, 'Testing ENCRYPTED(....................\n');
      })
  );

  it('multiple-start-tags.js case', () =>
    execShell('node test/cases/multiple-start-tags.js | node .')
      .then((stdout) => {
        // A second start tag between tags are ignored. The data is tried
        // to decrypt but it is of course invalid
        assert.strictEqual(stdout, 'Testing (INVALID ENCRYPTED DATA OR DECRYPTION KEY)\n');
      })
  );
});
