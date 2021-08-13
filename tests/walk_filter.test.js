const fs = require('fs')
const path = require('path')
const test = require('./_test')
const klaw = require('../')
const fixtures = require('./fixtures')

test('should not fire event on filtered items', function (t, testDir) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    const dir = path.dirname(f)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  const items = []
  const filter = function (filepath) {
    return path.basename(filepath) !== 'a'
  }

  klaw(testDir, { filter: filter })
    .on('data', function (item) {
      if (fs.lstatSync(item.path).isFile()) items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      let expected = ['c', 'b', 'a']
      expected = expected.map(function (item) {
        return path.join(testDir, item)
      })
      expected.unshift(testDir)

      t.ok(items.length < fixtures.length, 'we should see less items due to filter')
      t.end()
    })
})
