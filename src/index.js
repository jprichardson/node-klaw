var assert = require('assert')
var path = require('path')
var Readable = require('stream').Readable
var util = require('util')

// from Babel, for backwards compatibility with node 6.x
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg)
    var value = info.value
  } catch (error) {
    reject(error)
    return
  }

  if (info.done) {
    resolve(value)
  } else {
    Promise.resolve(value).then(_next, _throw)
  }
}

// from Babel, for backwards compatibility with node 6.x
function _asyncToGenerator(fn) {
  return function () {
    var self = this, args = arguments
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args)

      function _next(value) {
	asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value)
      }

      function _throw(err) {
	asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err)
      }

      _next(undefined)
    })
  }
}

function Walker(dir, options) {
  assert.strictEqual(typeof dir, 'string', '`dir` parameter should be of type string. Got type: ' + typeof dir)
  var defaultStreamOptions = { objectMode: true }
  var defaultOpts = {
    queueMethod: 'shift',
    pathSorter: undefined,
    filter: undefined,
    depthLimit: undefined,
    preserveSymlinks: false
  }
  options = Object.assign(defaultOpts, options, defaultStreamOptions)

  Readable.call(this, options)
  this.root = path.resolve(dir)
  this.paths = [this.root]
  this.options = options
  if (options.depthLimit > -1) this.rootDepth = this.root.split(path.sep).length + 1
  this.fs = options.fs || require('graceful-fs')
}

util.inherits(Walker, Readable)

Walker.prototype._readPath = function () {
  var _ref = _asyncToGenerator(function* (pathItem) {

    var statFunction = this.options.preserveSymlinks ? this.fs.lstat : this.fs.stat
    var self = this

    return statFunction(pathItem, function (err, stats) {
      var item = { path: pathItem, stats: stats }

      if (err) {
        self.emit('error', err, item)
        return
      }

      if (!stats.isDirectory() || self.rootDepth &&
	  pathItem.split(path.sep).length - self.rootDepth >= self.options.depthLimit) {
        return self.push(item)
      }

      self.fs.readdir(pathItem, function (err, pathItems) {
        if (err) {
          self.emit('error', err, item)
          return self.push(item)
        }

        pathItems = pathItems.map(part => path.join(pathItem, part))
        if (self.options.filter) pathItems = pathItems.filter(self.options.filter)
        if (self.options.pathSorter) pathItems.sort(self.options.pathSorter)
        // faster way to do do incremental batch array pushes
        self.paths.push.apply(self.paths, pathItems)

        return self.push(item)
      })
    })
  })

  return function (_x) {
    return _ref.apply(this, arguments)
  }
}()

Walker.prototype._read = _asyncToGenerator(function* () {
  let pushResult

  try {
    while (this.paths.length > 0 && pushResult !== false) {
      var pathItem = this.paths[this.options.queueMethod]()
      pushResult = yield this._readPath(pathItem)
    }
  } catch (err) {
    self.emit('error', err, { path: pathItem });
  }
})

function walk (root, options) {
  return new Walker(root, options)
}

module.exports = walk
