var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var test = require('./_test')
var klaw = require('../')
var fixtures = require('./fixtures_path-sorter')

test('should sort in reverse order [z -> a]', function (t, testDir) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    var dir = path.dirname(f)
    mkdirp.sync(dir)
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

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
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    var dir = path.dirname(f)
    mkdirp.sync(dir)
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

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
