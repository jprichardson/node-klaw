var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var test = require('./_test')
var klaw = require('../')
var fixtures = require('./fixtures')

test('should honor depthLimit option -1', function (t, testDir) {
  var expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i',
    'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
  run(t, testDir, -1, expected)
})

test('should honor depthLimit option 0', function (t, testDir) {
  var expected = ['a', 'h']
  run(t, testDir, 0, expected)
})

test('should honor depthLimit option 1', function (t, testDir) {
  var expected = ['a', 'a/b', 'a/e.jpg', 'h', 'h/i']
  run(t, testDir, 1, expected)
})

test('should honor depthLimit option 2', function (t, testDir) {
  var expected = ['a', 'a/b', 'a/b/c', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
    'h/i/l.txt', 'h/i/m.jpg']
  run(t, testDir, 2, expected)
})

test('should honor depthLimit option 3', function (t, testDir) {
  var expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i',
    'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
  run(t, testDir, 3, expected)
})

function run (t, testDir, depthLimit, expected) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    var dir = path.dirname(f)
    mkdirp.sync(dir)
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  var items = []
  klaw(testDir, { depthLimit: depthLimit })
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
}
