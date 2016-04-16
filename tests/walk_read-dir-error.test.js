var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var test = require('./_test')
var klaw = require('../')

test('walk directory, if error on readdir, at least end', function (t, testDir) {
  // simulate directory issue
  var unreadableDir = path.join(testDir, 'unreadable-dir')
  mkdirp.sync(unreadableDir)
  fs.chmodSync(unreadableDir, '0222')

  // not able to simulate on windows
  if (process.platform === 'win32') return t.end()

  t.plan(2)
  var items = []
  klaw(testDir)
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', function (err) {
      t.true(err, 'caught error')
    })
    .on('end', function () {
      t.true(true, 'be sure we end')
      t.end()
    })
})
