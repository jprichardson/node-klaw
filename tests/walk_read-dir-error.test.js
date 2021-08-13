const fs = require('fs')
const path = require('path')
const test = require('./_test')
const klaw = require('../')

test('walk directory, if error on readdir, at least end', function (t, testDir) {
  // simulate directory issue
  const unreadableDir = path.join(testDir, 'unreadable-dir')

  fs.mkdirSync(unreadableDir, { recursive: true })
  fs.chmodSync(unreadableDir, '0222')

  // not able to simulate on windows
  if (process.platform === 'win32') return t.end()

  t.plan(2)
  const items = []
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
