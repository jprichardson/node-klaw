var fs = require('fs')
var mkdirp = require('mkdirp')
var os = require('os')
var path = require('path')
var rimraf = require('rimraf')
var _test = require('tape')
var klaw = require('../')
var fixtures = require('./fixtures')

// for all practical purposes, this is a beforeEach and afterEach
function test (desc, testFn) {
  _test(desc, function (t) {
    var testDir = path.join(os.tmpdir(), 'klaw-tests')
    rimraf(testDir, function (err) {
      if (err) return t.end(err)
      mkdirp(testDir, function (err) {
        if (err) return t.end(err)

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

test('should work w/ streams 1', function (t, testDir) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    var dir = path.dirname(f)
    mkdirp.sync(dir)
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  var items = []
  klaw(testDir)
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      var expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
        'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})

test('should work w/ streams 2/3', function (t, testDir) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    var dir = path.dirname(f)
    mkdirp.sync(dir)
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  var items = []
  klaw(testDir)
    .on('readable', function () {
      var item
      while ((item = this.read())) {
        items.push(item.path)
      }
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      var expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
        'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})
