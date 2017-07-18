var assert = require('assert')
var path = require('path')
var Readable = require('stream').Readable
var util = require('util')

function Walker (dir, options) {
  assert.strictEqual(typeof dir, 'string', '`dir` parameter should be of type string. Got type: ' + typeof dir)
  var defaultStreamOptions = { objectMode: true }
  var defaultOpts = { queueMethod: 'shift', pathSorter: undefined, filter: undefined, depthLimit: undefined }
  options = Object.assign(defaultOpts, options, defaultStreamOptions)

  Readable.call(this, options)
  this.root = path.resolve(dir)
  this.paths = [this.root]
  this.options = options
  if (options.depthLimit > -1) this.rootDepth = this.root.split(path.sep).length
  this.fs = options.fs || require('graceful-fs')
}
util.inherits(Walker, Readable)

Walker.prototype._read = function () {
  if (this.paths.length === 0) return this.push(null)
  var self = this
  var pathItem = this.paths[this.options.queueMethod]()

  self.fs.lstat(pathItem, function (err, stats) {
    var item = { path: pathItem, stats: stats }
    if (err) return self.emit('error', err, item)
    if (!stats.isDirectory()) return self.push(item)

    self.fs.readdir(pathItem, function (err, pathItems) {
      if (err) {
        self.push(item)
        return self.emit('error', err, item)
      }

      pathItems = pathItems.map(function (part) { return path.join(pathItem, part) })
      if (self.options.filter) pathItems = pathItems.filter(self.options.filter)
      if (self.options.pathSorter) pathItems.sort(self.options.pathSorter)
      pathItems.forEach(function (pi) {
        // Only add paths to the list that are <= depthLimit
        if (self.rootDepth) {
          var currentDepth = pi.split(path.sep).length - self.rootDepth - 1
          if (currentDepth <= self.options.depthLimit) {
            self.paths.push(pi)
          }
        } else self.paths.push(pi)
      })

      self.push(item)
    })
  })
}

function walk (root, options) {
  return new Walker(root, options)
}

module.exports = walk
