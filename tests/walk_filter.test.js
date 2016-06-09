var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var test = require('./_test')
var klaw = require('../')
var fixtures = require('./fixtures')

test('should not fire event on filtered items', function (t, testDir) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    var dir = path.dirname(f)
    mkdirp.sync(dir)
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  var items = []
  var filter = function (filepath) {
    return path.basename(filepath) !== 'a'
  }

  klaw(testDir, {filter: filter})
    .on('data', function (item) {
      if (fs.lstatSync(item.path).isFile()) items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      var expected = ['c', 'b', 'a']
      expected = expected.map(function (item) {
        return path.join(testDir, item)
      })
      expected.unshift(testDir)

      t.ok(items.length < fixtures.length, 'we should see less items due to filter')
      t.end()
    })
})
