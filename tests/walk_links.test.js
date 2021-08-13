const fs = require('fs')
const path = require('path')
const test = require('./_test')
const klaw = require('../')
const fixtures = require('./fixtures_links.json')

function loadLinkFixtures (testDir) {
  Object.keys(fixtures).forEach(function (f) {
    const link = fixtures[f]
    f = path.join(testDir, f)

    const dir = path.dirname(f)
    fs.mkdirSync(dir, { recursive: true })

    if (link.target) {
      const realTarget = path.resolve(testDir, link.target)
      let missing
      if (!fs.existsSync(realTarget)) {
        missing = true
        fs.writeFileSync(realTarget, '')
      }
      fs.symlinkSync(link.target, f, link.type)
      if (missing) {
        fs.unlinkSync(realTarget)
      }
    } else {
      fs.writeFileSync(f, path.basename(f, path.extname(f)))
    }
  })
}

test('should follow links by default', function (t, testDir) {
  loadLinkFixtures(testDir)

  const items = []
  klaw(testDir)
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      let expected = ['a', 'a/b.txt', 'b', 'c', 'c/b.txt']
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})

test('should not follow links if requested', function (t, testDir) {
  loadLinkFixtures(testDir)

  const items = []
  klaw(testDir, { preserveSymlinks: true })
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      let expected = ['a', 'a/b.txt', 'b', 'c', 'd']
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})
