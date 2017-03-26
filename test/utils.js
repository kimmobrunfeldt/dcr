const defaultShell = require('spawn-default-shell');
const streamToPromise = require('stream-to-promise');

function execShell(cmd, opts) {
  const child = defaultShell.spawn(cmd, opts);
  return streamToPromise(child.stdout)
    .then(buf => buf.toString('utf-8'));
}

module.exports = {
  execShell,
};
