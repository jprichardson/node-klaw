var mkdirp = require('mkdirp')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var tape = require('tape')

// for all practical purposes, this is a beforeEach and afterEach
function test (desc, testFn) {
  tape(desc, function (t) {
    var testDir = path.join(os.tmpdir(), 'klaw-tests')
    rimraf(testDir, function (err) {
      if (err) return t.end(err)
      mkdirp(testDir).then(() => {
        var oldEnd = t.end
        t.end = function () {
          rimraf(testDir, function (err) {
            err ? oldEnd.apply(t, [err]) : oldEnd.apply(t, arguments)
          })
        }
        testFn(t, testDir)
      }).catch((err) => {
        return t.end(err)
      })
    })
  })
}

module.exports = test
