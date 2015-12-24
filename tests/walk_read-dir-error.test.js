var fs = require('fs')
var mkdirp = require('mkdirp')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var _test = require('tape')
var klaw = require('../')

// for all practical purposes, this is a beforeEach and afterEach
function test (desc, testFn) {
  _test(desc, function (t) {
    var testDir = path.join(os.tmpdir(), 'tests', 'klaw')
    rimraf(testDir, function (err) {
      if (err) return t.end(err)
      mkdirp(testDir, function (err) {
        if (err) return t.end(err)

        var unreadableDir = path.join(testDir, 'unreadable-dir')
        mkdirp.sync(unreadableDir)
        fs.chmodSync(unreadableDir, '0222')

        var oldEnd = t.end
        t.end = function () {
          rimraf(testDir, function (err) {
            err ? oldEnd.apply(t, [err]) : oldEnd.apply(t, arguments)
          })
        }

        testFn(t, testDir)
      })
    })
  })
}

test('walk directory, if error on readdir, at least end', function (t, testDir) {
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
