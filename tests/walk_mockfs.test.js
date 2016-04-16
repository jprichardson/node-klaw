var mkdirp = require('mkdirp')
var mockfs = require('mock-fs')
var os = require('os')
var path = require('path')
var test = require('tape')
var klaw = require('../')
var fixtures = require('./fixtures')
var fs = mockfs.fs()

test('walk directory on mockfs', function (t) {
  var testDir = path.join(os.tmpdir(), '/does/not/matter/in/mockfs')
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    var dir = path.dirname(f)
    mkdirp.sync(dir, { fs: fs })
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  t.plan(1)
  var items = []
  klaw(testDir, { fs: fs })
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
