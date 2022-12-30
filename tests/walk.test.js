const fs = require('fs')
const path = require('path')
const { pathToFileURL } = require('url')
const test = require('./_test')
const klaw = require('../')
const fixtures = require('./fixtures')

test('should work w/ streams 1', function (t, testDir) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    const dir = path.dirname(f)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  const items = []
  klaw(testDir)
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      let expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
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
    const dir = path.dirname(f)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  const items = []
  klaw(testDir)
    .on('readable', function () {
      let item
      while ((item = this.read())) {
        items.push(item.path)
      }
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      let expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
        'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})

test('should work w/ file URLs', function (t, testDir) {
  fixtures.forEach(function (f) {
    f = path.join(testDir, f)
    const dir = path.dirname(f)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(f, path.basename(f, path.extname(f)))
  })

  const items = []
  klaw(pathToFileURL(testDir))
    .on('data', function (item) {
      items.push(item.path)
    })
    .on('error', t.end)
    .on('end', function () {
      items.sort()
      let expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
        'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
      expected = expected.map(function (item) {
        return path.join(path.join(testDir, item))
      })
      expected.unshift(testDir)

      t.same(items, expected)
      t.end()
    })
})
