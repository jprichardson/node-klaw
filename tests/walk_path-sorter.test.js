var fs = require('fs')
var mkdirp = require('mkdirp')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var _test = require('tape')
var klaw = require('../')
var fixtures = require('./fixtures_path-sorter')

// for all practical purposes, this is a beforeEach and afterEach
function test (desc, testFn) {
  _test(desc, function (t) {
    var testDir = path.join(os.tmpdir(), 'klaw-tests')
    rimraf(testDir, function (err) {
      if (err) return t.end(err)
      mkdirp(testDir, function (err) {
        if (err) return t.end(err)

        fixtures.forEach(function (f) {
          f = path.join(testDir, f)
          var dir = path.dirname(f)
          mkdirp.sync(dir)
          fs.writeFileSync(f, path.basename(f, path.extname(f)))
        })

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

test('should sort in reverse order [z -> a]', function (t, testDir) {
  var items = []
  var pathSorter = function (a, b) { return b > a }
  klaw(testDir, { pathSorter: pathSorter })
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      var expected = ['c', 'b', 'a']
      expected = expected.map(function (item) {
        return path.join(testDir, item)
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})

test('should sort in order [a -> z]', function (t, testDir) {
  var items = []
  var pathSorter = function (a, b) { return a > b }
  klaw(testDir, { pathSorter: pathSorter })
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      var expected = ['a', 'b', 'c']
      expected = expected.map(function (item) {
        return path.join(testDir, item)
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})
