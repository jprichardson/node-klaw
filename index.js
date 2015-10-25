var fs = require('fs')
var path = require('path')
var Readable = require('stream').Readable
var util = require('util')
var assign = require('./assign')

function Walker (dir, streamOptions) {
  Readable.call(this, assign({}, streamOptions, { objectMode: true }))
  this.root = path.resolve(dir)
  this.paths = [this.root]
}
util.inherits(Walker, Readable)

Walker.prototype._read = function () {
  if (this.paths.length === 0) return this.push(null)
  var self = this
  var item = this.paths.shift()

  fs.lstat(item, function (err, stats) {
    if (err) return self.emit('error', err, { path: item, stats: stats })
    if (!stats.isDirectory()) return self.push({ path: item, stats: stats })

    fs.readdir(item, function (err, items) {
      if (err) return self.emit('error', err, { path: item, stats: stats })

      items.forEach(function (part) {
        self.paths.push(path.join(item, part))
      })

      self.push({ path: item, stats: stats })
    })
  })
}

function walk (path) {
  return new Walker(path)
}

module.exports = walk
