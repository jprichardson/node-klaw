const fs = require('fs')
const os = require('os')
const path = require('path')
const tape = require('tape')

// for all practical purposes, this is a beforeEach and afterEach
function test (desc, testFn) {
  tape(desc, function (t) {
    const testDir = path.join(os.tmpdir(), 'klaw-tests')
    fs.rm(testDir, { recursive: true, force: true }, function (err) {
      if (err) return t.end(err)
      fs.mkdir(testDir, function (err) {
        if (err) return t.end(err)

        const oldEnd = t.end
        t.end = function () {
          fs.rm(testDir, { recursive: true, force: true }, function (err) {
            err ? oldEnd.apply(t, [err]) : oldEnd.apply(t, arguments)
          })
        }

        testFn(t, testDir)
      })
    })
  })
}

module.exports = test
