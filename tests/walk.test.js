var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var test = require('./_test')
var klaw = require('../')
var fixtures = require('./fixtures')

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
