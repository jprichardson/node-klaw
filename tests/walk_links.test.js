var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var test = require('./_test')
var klaw = require('../')
var fixtures = require('./fixtures_links.json')

function loadLinkFixtures (testDir) {
  Object.keys(fixtures).forEach(function (f) {
    var link = fixtures[f]
    f = path.join(testDir, f)

    var dir = path.dirname(f)
    mkdirp.sync(dir)

    if (link.target) {
      fs.symlinkSync(link.target, f, link.type)
    } else {
      fs.writeFileSync(f, path.basename(f, path.extname(f)))
    }
  })
}

test('should not follow links by default', function (t, testDir) {
  loadLinkFixtures(testDir)

  var items = []
  klaw(testDir)
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      var expected = ['a', 'a/b.txt', 'b', 'c']
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})

test('should follow links if requested', function (t, testDir) {
  loadLinkFixtures(testDir)

  var items = []
  klaw(testDir, { followLinks: true })
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      var expected = ['a', 'a/b.txt', 'b', 'c', 'c/b.txt']
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})
