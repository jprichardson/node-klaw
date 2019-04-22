var assert = require('assert')
var path = require('path')
var Readable = require('stream').Readable
var util = require('util')

// from Babel, for backwards compatibility with node 6.x
function asyncGeneratorStep (gen, resolve, reject, _next, _throw, key, arg) {
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
function _asyncToGenerator (fn) {
  return function () {
    var self = this
    var args = arguments
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args)

      function _next (value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'next', value)
      }

      function _throw (err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, 'throw', err)
      }

      _next(undefined)
    })
  }
}

function Walker (dir, options) {
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
  this._inFlight = 0
}

util.inherits(Walker, Readable)

Walker.prototype._readPath = (function () {
  var _ref = _asyncToGenerator(function * (pathItem) {
    var statFunction = this.options.preserveSymlinks ? this.fs.lstat : this.fs.stat
    var self = this

    return new Promise((resolve, reject) => {
      statFunction(pathItem, function (err, stats) {
        var item = { path: pathItem, stats: stats }

        if (err) {
          self.emit('error', err, item)
          resolve()
          return
        }

        if (!stats.isDirectory() ||
            (self.rootDepth && pathItem.split(path.sep).length - self.rootDepth >= self.options.depthLimit)) {
          resolve(self.push(item))
          return
        }

        self.fs.readdir(pathItem, function (err, pathItems) {
          if (err) {
            self.emit('error', err, item)
            resolve(self.push(item))
            return
          }

          pathItems = pathItems.map(part => path.join(pathItem, part))
          if (self.options.filter) pathItems = pathItems.filter(self.options.filter)
          if (self.options.pathSorter) pathItems.sort(self.options.pathSorter)
          // faster way to do do incremental batch array pushes
          self.paths.push.apply(self.paths, pathItems)

          resolve(self.push(item))
        })
      })
    })
  })

  return function (_x) {
    return _ref.apply(this, arguments)
  }
}())

Walker.prototype._read = _asyncToGenerator(function * () {
  let pushResult

  if (this._inFlight > 0) {
    return
  }

  try {
    while (this.paths.length > 0 && pushResult !== false) {
      var pathItem = this.paths[this.options.queueMethod]()
      this._inFlight += 1
      pushResult = yield this._readPath(pathItem).then((result) => {
        this._inFlight -= 1

        if (this.paths.length === 0 && this._inFlight === 0) {
          this.push(null)
        }

        return result
      })
    }
  } catch (err) {
    this.emit('error', err, { path: pathItem })
  }
})

function walk (root, options) {
  return new Walker(root, options)
}

module.exports = walk
