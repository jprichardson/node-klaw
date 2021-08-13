const fs = require('fs')
const path = require('path')
const test = require('./_test')
const klaw = require('../')
const fixtures = require('./fixtures_path-sorter.json')

const stringCompare = function (a, b) {
  if (a < b) return -1
  else if (a > b) return 1
  else return 0
}

test('should sort in reverse order [z -> a]', function (t, testDir) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    const dir = path.dirname(f)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  const items = []
  const pathSorter = function (a, b) { return stringCompare(b, a) }
  klaw(testDir, { pathSorter: pathSorter })
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      let expected = ['c', 'b', 'a']
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
    const dir = path.dirname(f)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  const items = []
  const pathSorter = function (a, b) { return stringCompare(a, b) }
  klaw(testDir, { pathSorter: pathSorter })
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      let expected = ['a', 'b', 'c']
      expected = expected.map(function (item) {
        return path.join(testDir, item)
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})
